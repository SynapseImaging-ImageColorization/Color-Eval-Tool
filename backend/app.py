import base64
import os
import json
import random
import csv
import piq
import torch
import cv2
import time
from BigColor.colorize import infer_BigColor, initiate_BigColor

from flask import Flask, request
from flask_cors import CORS

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


api = Flask(__name__)
CORS(api, support_credentials=True)

# 모델 디렉토리
CS_MODEL_DIR = 'cs_flow/models/'

global scores
global classes

scores = []
classes = []

BigColor_eg, BigColor_z = initiate_BigColor()

def read_image(imagePath, resize_to=256, cvtToGray=False):
    img = cv2.imread(imagePath)
    if cvtToGray :
        img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
    img = cv2.resize(img, (resize_to, resize_to))
    img = torch.from_numpy(img).permute(2, 0, 1).unsqueeze(0).to(device)
    return img


# 모든 데이터 리스트 반환 함수
@api.route('/getAllData', methods=['GET'])
def getAllData():
    global scores
    global classes

    scores = []
    classes = []

    # argument(데이터셋 종류)
    dataset = request.args.get('dataset')

    # 데이터셋 디렉토리
    root_dir = "./dataset/Gray/test"

    data_label_list = []
    possible_img_extension = ['.png']  # 이미지 확장자들

    for (_, _, files) in os.walk(root_dir):
        if len(files) > 0:
            for file_name in files:
                if os.path.splitext(file_name)[1] in possible_img_extension:
                    data_label_list.append(file_name.replace("_2.png", ""))

    # 모든 이미지 랜덤으로 순서 변경
    random.shuffle(data_label_list)
    return {"list": data_label_list}


# 이미지 양/불량 판단
@api.route('/predict', methods=['GET'])
def predict():

    # arguments(모델 이름(CS-Flow), 데이터셋 종류, 이미지 이름)
    model = request.args.get('model')
    dataset = request.args.get('dataset') 
    label = request.args.get('img_name')
    print("\nlabel", label)

    dataset_dir_path = './dataset/'
    output_dir_path = "./Output/"

    # 이미지 경로
    img_input_path = os.path.join(dataset_dir_path, "Gray/test/", str(label) + "_2.png")
    img_gt_path = os.path.join(dataset_dir_path, "Color/test/", str(label) + "_4.png")

    response = dict()
    # 원본 이미지 인코딩
    with open(img_input_path, "rb") as f:
        image_binary = f.read()
        image = base64.b64encode(image_binary).decode("utf-8")
        response["input"] = image
    
    with open(img_gt_path, "rb") as f:
        image_binary = f.read()
        image = base64.b64encode(image_binary).decode("utf-8")
        response["gt"] = image
    
    if not os.path.exists(os.path.join(output_dir_path, str(model))):
        os.mkdir(os.path.join(output_dir_path, str(model)))
    
    start = time.time()
    image_output = infer_BigColor(BigColor_eg, BigColor_z, img_input_path)
    response["inference_time"] = round(time.time()-start, 4)
    output_path = os.path.join(output_dir_path, model, label + "_2.png")
    image_output.save(output_path)
    response["output"] = image_output
    with open(output_path, "rb") as f:
        image_binary = f.read()
        image = base64.b64encode(image_binary).decode("utf-8")
        response["output"] = image

    start = time.time()
    gtImg = read_image(img_gt_path, resize_to=256, cvtToGray=False)
    outputImg = read_image(output_path, resize_to=256, cvtToGray=False)
    psnr = piq.psnr(gtImg, outputImg, data_range=255).item()
    ssim = piq.ssim(gtImg, outputImg, data_range=255, downsample=True).item()
    piqLPIPS = piq.LPIPS()
    lpips = piqLPIPS(gtImg / 255.0, outputImg / 255.0).item()
    response["eval_time"] = round(time.time()-start, 4)
    response["psnr"] = round(psnr, 4)
    response["ssim"] = round(ssim, 4)
    response["lpips"] = round(lpips, 4)

    return json.dumps(response)

# 포트 51122에서 실행
api.run(host='0.0.0.0', port=51122, debug=True)
