from os.path import join
from BigColor.models import Colorizer
import torch
import pickle
from torchvision.transforms import ToTensor, ToPILImage, Grayscale, Resize
from PIL import Image

path_config = "./BigColor/pretrained/config.pickle"
path_ckpt_g = './BigColor/pretrained/G_ema_256.pth'
path_ckpt = './BigColor/ckpts/circuit'
dev = torch.device("cuda" if torch.cuda.is_available() else "cpu")
epoch = 152
dim_f = 16
size_target = 256

def initiate_BigColor():
    print('Target Epoch is %03d' % epoch)
    path_eg = join(path_ckpt, 'EG_%03d.ckpt' % epoch)
    path_args = join(path_ckpt, 'args.pkl')

    # Load Configuratuion
    with open(path_config, 'rb') as f:
        config = pickle.load(f)
    with open(path_args, 'rb') as f:
        args_loaded = pickle.load(f)
    
    # Load Colorizer
    EG = Colorizer(config, 
                   path_ckpt_g,
                   args_loaded.norm_type,
                   id_mid_layer=args_loaded.num_layer,
                   activation=args_loaded.activation, 
                   use_attention=args_loaded.use_attention,
                   dim_f=dim_f)
    EG.load_state_dict(torch.load(path_eg, map_location='cpu'), strict=True)
    EG.eval()
    EG.float()
    EG.to(dev)
    z = torch.zeros((1, args_loaded.dim_z)).to(dev)
    z.normal_(mean=0, std=0.8)
    return EG, z

def infer_BigColor(EG, z, img_path):
    im = Image.open(img_path)
    x = ToTensor()(im)
    x = Grayscale()(x)
    x = x.unsqueeze(0)
    x = x.to(dev)
    c = torch.LongTensor([0]).to(dev)
    
    resizer = Resize(size_target, antialias=True)
    x_resize = resizer(x)

    with torch.no_grad():
        output = EG(x_resize, c, z)
        output = output.add(1).div(2)

    output = output.squeeze(0)
    output = output.detach().cpu()
    im = ToPILImage()(output)

    return im