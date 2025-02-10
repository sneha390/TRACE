from Service.clarifaiScript import checkDrugFromImage
from Service.imgurClient import uploadImage


def imageUrlDetection(url):
    return  checkDrugFromImage(url)

def imageFileDetection(filename):
    filename = filename.split()
    Imageurl =  uploadImage(f"Media/{filename[0]}/{filename[1]}")
    return  checkDrugFromImage(Imageurl), Imageurl
