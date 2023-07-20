import argparse
import os
import shutil
import warnings

import cv2
import pandas as pd
import piq
import torch
from torch.utils.data import DataLoader, Dataset
from tqdm import tqdm

warnings.filterwarnings("ignore")

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


def main(args):
    GT_PATH, OUT_PATH = args.gt_path, args.out_path
    labels = ["_".join(file.split("_")[:-1]) for file in os.listdir(GT_PATH)]
    total_image_count = len(os.listdir(GT_PATH))

    # Prompt user for remaining existing metrics folder
    remove_original_directory(path_name=args.output_path)

    for output_type in os.listdir(OUT_PATH):
        # Subdirectory might not be image folder
        if len(os.listdir(os.path.join(OUT_PATH, output_type))) != total_image_count:
            continue

        # Metrics might be already calculated
        if os.path.exists(f"./result/{output_type}.csv") and os.path.exists(
            f"./avg_result/{output_type}.csv"
        ):
            print(
                f"[WARNING] Metrics for {output_type} already calculated. Overwrite (y/n)?",
                end=" ",
            )
            should_delete = input()
            if should_delete != "y":
                continue

        print(f"Calculating full reference metrics for {output_type}...")
        psnr, ssim, ms_ssim, iw_ssim = [], [], [], []
        vif_p, fsim, sr_sim, gmsd, lpips = [], [], [], [], []
        ms_gmsd, vsi, dss, haarpsi, mdsi = [], [], [], [], []
        lpips_loss = piq.LPIPS()

        for label in tqdm(labels):
            gt, out = read_image(
                gt_subpath=f"{label}_4.png",
                out_subpath=f"{output_type}/{label}_2.png",
                resize_to=256,
            )

            psnr.append(piq.psnr(gt, out, data_range=255).item())
            ssim.append(piq.ssim(gt, out, data_range=255, downsample=True).item())
            ms_ssim.append(piq.multi_scale_ssim(gt, out, data_range=255).item())
            iw_ssim.append(
                piq.information_weighted_ssim(gt, out, data_range=255).item()
            )
            vif_p.append(piq.vif_p(gt, out, data_range=255).item())
            fsim.append(piq.fsim(gt, out, data_range=255).item())
            sr_sim.append(piq.srsim(gt, out, data_range=255).item())
            gmsd.append(piq.gmsd(gt, out, data_range=255).item())
            ms_gmsd.append(piq.multi_scale_gmsd(gt, out, data_range=255).item())
            vsi.append(piq.vsi(gt, out, data_range=255).item())
            dss.append(piq.dss(gt, out, data_range=255).item())
            haarpsi.append(piq.haarpsi(gt, out, data_range=255).item())
            mdsi.append(piq.mdsi(gt, out, data_range=255).item())
            lpips.append(lpips_loss(gt / 255.0, out / 255.0).item())

        df = pd.DataFrame(
            {
                "label": labels,
                "psnr": psnr,
                "ssim": ssim,
                "ms_ssim": ms_ssim,
                "iw_ssim": iw_ssim,
                "vif_p": vif_p,
                "fsim": fsim,
                "sr_sim": sr_sim,
                "gmsd": gmsd,
                "ms_gmsd": ms_gmsd,
                "vsi": vsi,
                "dss": dss,
                "haarpsi": haarpsi,
                "mdsi": mdsi,
                "lpips": lpips,
            }
        )
        df.to_csv(f"./result/{output_type}.csv", index=False)

        print(f"Calculating distribution based metrics for {output_type}...")
        gt_ds = CustomImageDataset(labels, GT_PATH, suffix="_4.png")
        out_ds = CustomImageDataset(
            labels, os.path.join(OUT_PATH, output_type), suffix="_2.png"
        )

        gt_dl = DataLoader(gt_ds, batch_size=4, shuffle=True)
        out_dl = DataLoader(out_ds, batch_size=4, shuffle=True)

        is_metric = piq.IS()
        gt_feats, out_feats = is_metric.compute_feats(gt_dl), is_metric.compute_feats(
            out_dl
        )
        inception_score = is_metric(gt_feats, out_feats).item()

        fid_metric = piq.FID()
        gt_feats, out_feats = fid_metric.compute_feats(gt_dl), fid_metric.compute_feats(
            out_dl
        )
        fid = fid_metric(gt_feats, out_feats).item()

        kid_metric = piq.KID()
        gt_feats, out_feats = kid_metric.compute_feats(gt_dl), kid_metric.compute_feats(
            out_dl
        )
        kid = kid_metric(gt_feats, out_feats).item()

        avg_df = pd.DataFrame.from_dict(
            {
                "is": inception_score,
                "fid": fid,
                "kid": kid,
                "psnr": df["psnr"].mean(),
                "ssim": df["ssim"].mean(),
                "ms_ssim": df["ms_ssim"].mean(),
                "iw_ssim": df["iw_ssim"].mean(),
                "vif_p": df["vif_p"].mean(),
                "fsim": df["fsim"].mean(),
                "sr_sim": df["sr_sim"].mean(),
                "gmsd": df["gmsd"].mean(),
                "ms_gmsd": df["ms_gmsd"].mean(),
                "vsi": df["vsi"].mean(),
                "dss": df["dss"].mean(),
                "haarpsi": df["haarpsi"].mean(),
                "mdsi": df["mdsi"].mean(),
                "lpips": df["lpips"].mean(),
            },
            orient="index"
        )

        avg_df['metric_name'] = pd.Series([
            "is", "fid", "kid", "psnr_mean", "ssim_mean",
            "ms_ssim_mean", "iw_ssim_mean", "vif_p_mean",
            "fsim_mean", "sr_ssim_mean", "gmsd_mean",
            "ms_gmsd_mean", "vsi_mean", "dss_mean",
            "haarpsi_mean", "mdsi_mean", "lpips_mean"
        ])
        
        avg_df.to_csv(f"./avg_result/{output_type}.csv", index=False)


class CustomImageDataset(Dataset):
    def __init__(self, labels, img_dir, suffix=""):
        self.labels = labels
        self.img_dir = img_dir
        self.suffix = suffix

    def __len__(self):
        return len(self.labels)

    def __getitem__(self, idx):
        img_path = os.path.join(self.img_dir, f"{self.labels[idx]}{self.suffix}")
        img = cv2.imread(img_path)
        img = cv2.resize(img, (256, 256))
        img = torch.from_numpy(img).permute(2, 0, 1).to(device) / 255
        return {"images": img}


def remove_original_directory(path_name="metrics_result"):
    if os.path.exists(f"./{path_name}"):
        print(f"[WARNING] {path_name} directory already exists. Delete (y/n)?", end=" ")
        should_delete = input()

        if should_delete == "y":
            shutil.rmtree(f"./{path_name}")
            os.mkdir(f"./{path_name}")
            os.chdir(f"./{path_name}")
            os.mkdir("./avg_result")
            os.mkdir("./result")
        else:
            os.chdir(f"./{path_name}")
    else:
        os.mkdir(f"./{path_name}")
        os.chdir(f"./{path_name}")
        os.mkdir("./avg_result")
        os.mkdir("./result")


def read_image(gt_subpath, out_subpath, resize_to=256):
    gt = cv2.imread(os.path.join(GT_PATH, gt_subpath))
    out = cv2.imread(os.path.join(OUT_PATH, out_subpath))

    gt = cv2.resize(gt, (resize_to, resize_to))
    out = cv2.resize(out, (resize_to, resize_to))

    gt = torch.from_numpy(gt).permute(2, 0, 1).unsqueeze(0).to(device)
    out = torch.from_numpy(out).permute(2, 0, 1).unsqueeze(0).to(device)
    return (gt, out)


if __name__ == "__main__":
    GT_PATH = "/home/work/Circuit/dataset/Color/test"
    OUT_PATH = "/home/work/Synapse/OUTPUT/data/"

    parser = argparse.ArgumentParser()
    parser.add_argument(
        "-o", "--output", dest="output_path", action="store", default="./metrics_result"
    )
    parser.add_argument(
        "-g", "--gt_path", dest="gt_path", action="store", default=GT_PATH
    )
    parser.add_argument(
        "-d", "--out_path", dest="out_path", action="store", default=OUT_PATH
    )
    args = parser.parse_args()
    main(args)
