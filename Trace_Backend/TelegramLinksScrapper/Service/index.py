from Service.clarifaiScript import checkDrugFromImage
from Service.imageDescription import detectDrugFromImage
from Service.imgurClient import uploadImage


def imageUrlDetection(url):
    try:
        return  checkDrugFromImage(url)
    except Exception as e:
        print(e)
        return None

def imageFileDetection(filename):
    try:
        filename = filename.split()
        Imageurl =  uploadImage(f"Media/{filename[0]}/{filename[1]}")
        return  detectDrugFromImage(f"{filename[0]}/{filename[1]}"), Imageurl
    except Exception as e:
        print (e)
        return r'{"DrugIdentified":"false"}',""