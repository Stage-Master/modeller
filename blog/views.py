from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from .versions import Version
from .models import Model
from .import anchor
from . import attribute
from . import knot
from . import tie
from . import tieFact
from . import historizedAttribute
from . import historizedTie
from . import historizedTieFact
from django.utils import timezone
import json

def home(request):
     models= Model.objects.all()
     if (len(models)!=0):
         modelID = models[0].id
     else :
         modelID=0
     versions= Version.objects.filter(modelID=modelID).order_by('-date')
     return render(request,'blog/home.html', {'versions': versions,'models':models, 'modelID': modelID})

def modeller(request,id, title):
     version=Version(id=id,title=title, content="{}")
     return render(request,'blog/modeler.html', {'version': version} )



def modellerFromVersion(request,id):
    version=Version.objects.get(id=id)
    return render(request,'blog/modeler.html',{'version': version} )


def modellerFromVersionSave(request):
    if request.is_ajax and request.method == "GET":
       id= request.GET.get("id", None)
       content = request.GET.get("content", None)
       version = Version.objects.get(id=id)
       version.content=content
       version.date=timezone.now()
       version.save()
       return JsonResponse({})

def createModel(request,id):
          title= request.GET['inputCreateModel']
          version=Version(title=title,content="{}",modelID=id)
          version.save()
          models = Model.objects.all()
          versions = Version.objects.filter(modelID=id).order_by('-date')
          return render(request,'blog/home.html', {'models':models,'versions': versions, 'modelID': id} )

def createSuperModel(request,id):
      title = request.GET['inputCreateSuperModel']
      model = Model(title= title )
      model.save()
      models = Model.objects.all()
      if (len(models)==1):
        modelID = models[0].id
      else :
        modelID=id
      versions = Version.objects.filter(modelID=modelID).order_by('-date')
      return render(request, 'blog/home.html', {'models': models, 'versions': versions, 'modelID':modelID})

def deleteModel(request,id,modelID):
    Version.objects.get(id=id).delete()
    models = Model.objects.all()
    versions = Version.objects.filter(modelID=modelID).order_by('-date')
    return render(request, 'blog/home.html', {'models': models, 'versions': versions, 'modelID': modelID})

def deleteSuperModel(request,id):
    Model.objects.get(id=id).delete()
    Version.objects.filter(modelID=id).delete()
    models = Model.objects.all()
    if (len(models) != 0):
        modelID = models[0].id
    else:
        modelID = 0
    versions = Version.objects.filter(modelID=modelID).order_by('-date')
    return render(request, 'blog/home.html', {'versions': versions, 'models':models, 'modelID':modelID})


def copyModel(request,title, content, modelID):
    version=Version.objects.create(title=title+' Copy', content=content, date=timezone.now(),modelID=modelID)
    version.save()
    models = Model.objects.all()
    versions = Version.objects.filter(modelID=modelID).order_by('-date')
    return render(request, 'blog/home.html', {'models': models, 'versions': versions, 'modelID': modelID})


def renameModel(request,id):
    idVersion = request.GET['inputRenameModelID']
    title = request.GET['inputRenameModelTitle']
    version=Version.objects.get(id= idVersion )
    version.title=title
    version.date=timezone.now()
    version.save()
    models = Model.objects.all()
    versions = Version.objects.filter(modelID=id).order_by('-date')
    return render(request, 'blog/home.html', {'models':models,'versions': versions,'modelID':id })

def renameSuperModel(request):
    id = request.GET['inputRenameSuperModelID']
    title = request.GET['inputRenameSuperModelTitle']
    model=Model.objects.get(id=id)
    model.title=title
    model.save()
    models = Model.objects.all()
    versions = Version.objects.filter(modelID=id).order_by('-date')
    return render(request, 'blog/home.html', {'models': models, 'versions': versions, 'modelID': id})
def loadModel(request):
    if request.is_ajax and request.method == "GET":
        title = request.GET.get("title", None)
        content = request.GET.get("content", None)
        lastVersion = Version.objects.order_by('id').last()
        version = Version(id=lastVersion.id + 1, title=title, content=content)
        version.save()
        return JsonResponse({})

def loadModelVersions(request,id):
    models = Model.objects.all()
    versions = Version.objects.filter(modelID=id).order_by('-date')
    return render(request, 'blog/home.html', {'versions': versions, 'models': models, 'modelID':id})


def importModel(request):
    if request.is_ajax and request.method == "GET":
       title = request.GET.get("title", None)
       content = request.GET.get("content", None)
       modelID= request.GET.get("modelID", None)
       lastVersion = Version.objects.order_by('id').last()
       version = Version(id=lastVersion.id + 1, title=title, content=content, modelID=modelID)
       version.save()
       return JsonResponse({})




def SQLConvertor(request):
  if request.is_ajax and request.method == "GET":
    jsonString=request.GET.get("jsonString", None)
    dbms= request.GET.get("dbms", None)
    view = request.GET.get("view", None)
    sql=contentConvertor(jsonString,dbms, view)
    return JsonResponse({"sql": sql})

def JSONConvertor(request):
  if request.is_ajax and request.method == "GET":
    jsonString=request.GET.get("jsonString", None)
    schema=json.dumps(json.loads(jsonString).get("nodeDataArray"))
    schema = schema.replace("[", "")
    schema = schema.replace("]", "")
    schema=schema.replace("},","},<br>")
    return JsonResponse({"schema": schema})

def sqlRequest(nodes, dbms, view):
    sql=""
    anchorObjects=[]
    knotObjects=[]
    attributeObjects=[]
    tieObjects=[]
    tieFactObjects=[]
    for node in nodes:
        if node["category"]=="Anchor":
            anchorObjects.append(anchor.anchor(node["ID"],node["Mnemonic"],node["Name"]))
        if node["category"]=="Attribute":
            attributeObjects.append(attribute.attribute(node["Mnemonic"], node["Name"],node["FieldName"],node["FieldType"], node["anchorID"],node["anchorMnemonic"],node["anchorName"],node["knotID"],node["knotMnemonic"], node["knotName"]))
        if node["category"]=="Historized.Attribute":
            attributeObjects.append(historizedAttribute.historizedAttribute(node["Mnemonic"], node["Name"],node["FieldName"],node["FieldType"], node["anchorID"],node["anchorMnemonic"],node["anchorName"],node["knotID"],node["knotMnemonic"], node["knotName"]))
        if node["category"] == "Knot":
            knotObjects.append(knot.knot(node["ID"],node["Mnemonic"],node["Name"] , node["FieldName"], node["FieldType"]))
        if node["category"] == "Tie":
            tieObjects.append(tie.tie(node["Mnemonic"],node["Name"],node["listAnchor"]))
        if node["category"] == "Historized.Tie":
            tieObjects.append(historizedTie.historizedTie(node["Mnemonic"],node["Name"],node["listAnchor"]))
        if node["category"] == "TieFact":
            tieFactObjects.append(tieFact.tieFact(node["Mnemonic"],node["Name"],node["listAnchor"],node["Measure"], node["MeasureType"]))
        if node["category"] == "Historized.TieFact":
            tieFactObjects.append(historizedTieFact.historizedTieFact(node["Mnemonic"],node["Name"],node["listAnchor"],node["Measure"], node["MeasureType"]))

    sql=sql+'-----------------------------------------------------------------\n' \
            '------ Anchor Schema                                              \n' \
            '------------------------------------------------------------------\n\n'
    for anchorObject in anchorObjects:
        sql = sql + anchorObject.toSQL()
    sql = sql + '\n\n-----------------------------------------------------------------\n' \
                '------ Knot Schema                                              \n' \
                '------------------------------------------------------------------\n\n'
    for knotObject in knotObjects:
        sql = sql + knotObject.toSQL()

    sql = sql + '\n\n-----------------------------------------------------------------\n' \
               '------ Attribute Schema                                              \n' \
               '------------------------------------------------------------------\n\n'
    for attributeObject in attributeObjects:
        sql = sql + attributeObject.toSQL()

    sql = sql + '\n\n-----------------------------------------------------------------\n' \
                '------ Tie Schema                                              \n' \
                '------------------------------------------------------------------\n\n'
    for tieObject in tieObjects:
        sql = sql + tieObject.toSQL()
    sql = sql + '\n\n-----------------------------------------------------------------\n' \
                '------ TieFact Schema                                              \n' \
                '------------------------------------------------------------------\n\n'
    for tieFactObject in tieFactObjects:
        sql = sql + tieFactObject.toSQL()
    if (view=="withView"):
        anchorViews = []
        for anchorObject in anchorObjects:
            anchorView = {}
            anchorView["id"] = anchorObject.id
            anchorView["mnemonic"] = anchorObject.mnemonic
            anchorView["name"] = anchorObject.name
            anchorView["listAttribute"] = []
            anchorView["listHistorizedAttribute"] = []
            for attributeObject in attributeObjects:
                if attributeObject.anchorMnemonic == anchorObject.mnemonic and isinstance(attributeObject, attribute.attribute):
                    anchorView["listAttribute"].append(
                        {"mnemonic": attributeObject.mnemonic, "name": attributeObject.name,
                         "dataName": attributeObject.dataName})
                if attributeObject.anchorMnemonic == anchorObject.mnemonic and isinstance(attributeObject, historizedAttribute.historizedAttribute):
                    anchorView["listHistorizedAttribute"].append(
                        {"mnemonic": attributeObject.mnemonic, "name": attributeObject.name,
                         "dataName": attributeObject.dataName})
            anchorViews.append(anchorView)
        sql = sql + '\n\n-----------------------------------------------------------------\n' \
                    '------ Complete Views                                             \n' \
                    '------------------------------------------------------------------'
        for anchorView in anchorViews:
            if dbms=="PostgreSQL":
                sql = sql + '\n\nCREATE MATERIALIZED VIEW ' + anchorView["mnemonic"] + '_' + anchorView["name"] + '_CompleteView AS \n SELECT ' + anchorView["mnemonic"] + '.' + anchorView["id"]
            if dbms=="MySQL":
                sql = sql + '\n\nCREATE VIEW ' + anchorView["mnemonic"] + '_' + anchorView["name"] + '_CompleteView AS \n SELECT ' + anchorView["mnemonic"] + '.' + anchorView["id"]
            for a in anchorView["listAttribute"]:
                sql = sql + ',\n ' + a["mnemonic"] + '.' + a["dataName"]
            for ha in anchorView["listHistorizedAttribute"]:
                sql = sql + ',\n ' + ha["mnemonic"] + '.' + ha["dataName"] + ' , ' + ha["mnemonic"] + '.' + ha["mnemonic"] + '_ValidFrom'
            sql = sql + '\nFROM ' + anchorView["mnemonic"] + '_' + anchorView["name"] + ' ' + anchorView["mnemonic"]
            for a in anchorView["listAttribute"]:
                sql = sql + '\n LEFT JOIN ' + a["mnemonic"] + '_' + a["dataName"] + ' ' + a["mnemonic"] + '\nON ' + \
                      anchorView["mnemonic"] + '.' + anchorView["id"] + '=' + a["mnemonic"] + '.' + anchorView["id"]
            for ha in anchorView["listHistorizedAttribute"]:
                sql = sql + '\n LEFT JOIN ' + ha["mnemonic"] + '_' + ha["dataName"] + ' ' + ha["mnemonic"] + '\nON ' + \
                      anchorView["mnemonic"] + '.' + anchorView["id"] + '=' + ha["mnemonic"] + '.' + anchorView["id"]
            sql = sql + ';'

        sql = sql + '\n\n-----------------------------------------------------------------\n' \
                    '------ Latest Views                                             \n' \
                    '------------------------------------------------------------------'
        for anchorView in anchorViews:
            if (len(anchorView["listHistorizedAttribute"]) != 0):
                if (dbms == "PostgreSQL"):

                   sql = sql + '\n\nCREATE MATERIALIZED VIEW ' + anchorView["mnemonic"] + '_' + anchorView["name"] + '_LatestView AS \n SELECT CVIEW.' + anchorView["id"]
                if (dbms == "MySQL"):
                    sql = sql + '\n\nCREATE VIEW ' + anchorView["mnemonic"] + '_' + anchorView["name"] + '_LatestView AS \n SELECT CVIEW.' + anchorView["id"]
                for ha in anchorView["listHistorizedAttribute"]:
                    sql = sql + ',\n CVIEW.' + ha["dataName"]
                sql = sql + '\nFROM ' + anchorView["mnemonic"] + '_' + anchorView["name"] + '_CompleteView CVIEW \n WHERE'
                cpt = 1;
                for ha in anchorView["listHistorizedAttribute"]:
                    if (cpt == 1):
                        sql = sql + '     \nCVIEW.' + ha["mnemonic"] + '_ValidFrom=(\n SELECT MAX(LVIEW.' + ha["mnemonic"] + '_ValidFrom)\n     FROM ' + anchorView["mnemonic"] + '_' + anchorView["name"] + '_CompleteView LVIEW \n      WHERE CVIEW.' + anchorView["id"] + '=LVIEW.' + anchorView["id"] + '\n)'
                        cpt = cpt + 1
                    else:
                        sql = sql + '\nAND\n    CVIEW.' + ha["mnemonic"] + '_ValidFrom=(\n     SELECT MAX(LVIEW.' + ha["mnemonic"] + '_ValidFrom)\n     FROM ' + anchorView["mnemonic"] + '_' + anchorView["name"] + '_CompleteView LVIEW\n     WHERE CVIEW.' + anchorView["id"] + '=LVIEW.' + anchorView["id"] + '\n)'
                sql = sql + ";"
    return sql


def contentConvertor(jsonString,dbms, view):
    data = json.loads(jsonString)
    nodes = data.get("nodeDataArray")
    links = data.get("linkDataArray")
    for node in nodes:
        if node["category"] == "Tie" or node["category"] == "TieNotConsider" :
            node["listAnchor"] = []
        if node["category"] == "Historized.Tie" or node["category"] == "Historized.TieNotConsider" :
            node["listAnchor"] = []
        if node["category"] == "TieFact" or node["category"] == "TieFactNotConsider" :
            node["listAnchor"] = []
        if node["category"] == "Historized.TieFact" or node["category"] == "Historized.TieFactNotConsider":
            node["listAnchor"] = []
        if node["category"] == "Attribute" or node["category"] == "AttributeNotConsider":
            node["anchorID"] = ""
            node["anchorName"] = ""
            node["anchorMnemonic"] = ""
            node["knotID"] = ""
            node["knotName"] = ""
            node["knotMnemonic"] = ""
        if node["category"] == "Historized.Attribute" or node["category"] == "Historized.AttributeNotConsider":
            node["anchorID"] = ""
            node["anchorName"] = ""
            node["anchorMnemonic"] = ""
            node["knotID"] = ""
            node["knotName"] = ""
            node["knotMnemonic"] = ""
    for link in links:
        # variables that contain linked nodes
        fromNode = ""
        toNode = ""
        for node in nodes:
            if node["key"] == link["from"]:
                fromNode = node
                fromIndex = nodes.index(node)
            if node["key"] == link["to"]:
                toNode = node
                toIndex = nodes.index(node)
            # to stop whenever we find the correspondant nodes
            if fromNode != "" and toNode != "":
                break

        # checking the tuple (anchor, tie) or (tie, anchor)
        if (fromNode["category"] == "Anchor" or fromNode["category"] == "AnchorNotConsider" ) and (toNode["category"] == "Tie" or toNode["category"] == "TieNotConsider"):
            toNode["listAnchor"].append(
                {"ID": fromNode["ID"], "Name": fromNode["Name"], "Mnemonic": fromNode["Mnemonic"]})
            nodes[toIndex] = toNode
        if (toNode["category"] == "Anchor" or toNode["category"] == "AnchorNotConsider") and (fromNode["category"] == "Tie" or fromNode["category"] == "TieNotConsider"):
            fromNode["listAnchor"].append({"ID": toNode["ID"], "Name": toNode["Name"], "Mnemonic": toNode["Mnemonic"]})
            nodes[fromIndex] = fromNode
        # cheking the tupes (anchor, Historized.Tie)
        if (fromNode["category"] == "Anchor" or fromNode["category"] == "AnchorNotConsider") and (toNode["category"] == "Historized.Tie" or toNode["category"] == "Historized.TieNotConsider" ):
            toNode["listAnchor"].append(
                {"ID": fromNode["ID"], "Name": fromNode["Name"], "Mnemonic": fromNode["Mnemonic"]})
            nodes[toIndex] = toNode
        if (toNode["category"] == "Anchor" or toNode["category"] == "AnchorNotConsider") and (fromNode["category"] == "Historized.Tie" or fromNode["category"] == "Historized.TieNotConsider"):
            fromNode["listAnchor"].append({"ID": toNode["ID"], "Name": toNode["Name"], "Mnemonic": toNode["Mnemonic"]})
            nodes[fromIndex] = fromNode
        # checking the tuple (anchor, tieFact) or (tieFact, anchor)
        if (fromNode["category"] == "Anchor" or fromNode["category"] == "AnchorNotConsider" ) and (toNode["category"] == "TieFact" or toNode["category"] == "TieFactNotConsider"):
            toNode["listAnchor"].append(
                {"ID": fromNode["ID"], "Name": fromNode["Name"], "Mnemonic": fromNode["Mnemonic"]})
            nodes[toIndex] = toNode
        if (toNode["category"] == "Anchor" or toNode["category"] == "AnchorNotConsider") and (fromNode["category"] == "TieFact" or fromNode["category"] == "TieFactNotConsider" ):
            fromNode["listAnchor"].append({"ID": toNode["ID"], "Name": toNode["Name"], "Mnemonic": toNode["Mnemonic"]})
            nodes[fromIndex] = fromNode
        # chaking the tupes (anchor, Historized.TieFact)
        if (fromNode["category"] == "Anchor" or fromNode["category"] == "AnchorNotConsider") and (toNode["category"] == "Historized.TieFact" or toNode["category"] == "Historized.TieFactNotConsider"):
            toNode["listAnchor"].append(
                {"ID": fromNode["ID"], "Name": fromNode["Name"], "Mnemonic": fromNode["Mnemonic"]})
            nodes[toIndex] = toNode
        if (toNode["category"] == "Anchor" or toNode["category"] == "AnchorNotConsider" ) and (fromNode["category"] == "Historized.TieFact" or fromNode["category"] == "Historized.TieFactNotConsider"):
            fromNode["listAnchor"].append({"ID": toNode["ID"], "Name": toNode["Name"], "Mnemonic": toNode["Mnemonic"]})
            nodes[fromIndex] = fromNode
        # checking the tuple (anchor, attribute) or (attribute, anchor)
        if (fromNode["category"] == "Anchor" or fromNode["category"] == "AnchorNotConsider" ) and (toNode["category"] == "Attribute" or toNode["category"] == "AttributeNotConsider" ):
            toNode["anchorID"] = fromNode["ID"]
            toNode["anchorName"] = fromNode["Name"]
            toNode["anchorMnemonic"] = fromNode["Mnemonic"]
            nodes[toIndex] = toNode
        if (toNode["category"] == "Anchor" or toNode["category"] == "AnchorNotConsider" ) and (fromNode["category"] == "Attribute" or fromNode["category"] == "AttributeNotConsider"):
            fromNode["anchorID"] = toNode["ID"]
            fromNode["anchorName"] = toNode["Name"]
            fromNode["anchorMnemonic"] = toNode["Mnemonic"]
            nodes[fromIndex] = fromNode
        # checking the tuple (knot, attribute) or (attribute, knot)
        if (fromNode["category"] == "Knot" or fromNode["category"] == "KnotNotConsider") and (toNode["category"] == "Attribute" or toNode["category"] == "AttributeNotConsider"):
            toNode["knotID"] = fromNode["ID"]
            toNode["knotName"] = fromNode["Name"]
            toNode["knotMnemonic"] = fromNode["Mnemonic"]
            nodes[toIndex] = toNode
        if (toNode["category"] == "Knot" or toNode["category"] == "KnotNotConsider" ) and (fromNode["category"] == "Attribute" or fromNode["category"] == "AttributeNotConsider"):
            fromNode["knotID"] = toNode["ID"]
            fromNode["knotName"] = toNode["Name"]
            fromNode["knotMnemonic"] = toNode["Mnemonic"]
            nodes[fromIndex] = fromNode
            # checking the tuple (anchor, Historized.Attribute) or (Historized.Attribute, anchor)
        if (fromNode["category"] == "Anchor" or fromNode["category"] == "AnchorNotConsider") and (toNode["category"] == "Historized.Attribute" or toNode["category"] == "Historized.AttributeNotConsider"):
            toNode["anchorID"] = fromNode["ID"]
            toNode["anchorName"] = fromNode["Name"]
            toNode["anchorMnemonic"] = fromNode["Mnemonic"]
            nodes[toIndex] = toNode
        if (toNode["category"] == "Anchor" or toNode["category"] == "AnchorNotConsider" ) and (fromNode["category"] == "Historized.Attribute" or fromNode["category"] == "Historized.AttributeNotConsider" ):
            fromNode["anchorID"] = toNode["ID"]
            fromNode["anchorName"] = toNode["Name"]
            fromNode["anchorMnemonic"] = toNode["Mnemonic"]
            nodes[fromIndex] = fromNode
            # checking the tuple (knot, attribute) or (attribute, knot)
        if (fromNode["category"] == "Knot" or fromNode["category"] == "KnotNotConsider" ) and (toNode["category"] == "Historized.Attribute" or toNode["category"] == "Historized.AttributeNotConsider"):
            toNode["knotID"] = fromNode["ID"]
            toNode["knotName"] = fromNode["Name"]
            toNode["knotMnemonic"] = fromNode["Mnemonic"]
            nodes[toIndex] = toNode
        if (toNode["category"] == "Knot" or toNode["category"] == "KnotNotConsider") and (fromNode["category"] == "Historized.Attribute" or fromNode["category"] == "Historized.AttributeNotConsider" ):
            fromNode["knotID"] = toNode["ID"]
            fromNode["knotName"] = toNode["Name"]
            fromNode["knotMnemonic"] = toNode["Mnemonic"]
            nodes[fromIndex] = fromNode
    sql = sqlRequest(nodes, dbms, view)
    return sql




def compare(request, idOld, idRecent):
    versionOld = Version.objects.get(id=idOld)
    versionRecent = Version.objects.get(id=idRecent)
    dataOld=json.loads(versionOld.content)
    dataRecent = json.loads(versionRecent.content)
    nodesOld = dataOld.get("nodeDataArray")
    nodesRecent=dataRecent.get("nodeDataArray")
    for nodeRecent in nodesRecent:
        exist=False
        mnemonic=nodeRecent["Mnemonic"]
        for nodeOld in nodesOld:
            if mnemonic==nodeOld["Mnemonic"]:
                exist=True
                break
        if exist==False:
            index=nodesRecent.index(nodeRecent)
            nodeRecent["category"]=nodeRecent["category"]+"WithinRectangle"
            nodesRecent[index]=nodeRecent

    dataRecent["nodeDataArray"]=nodesRecent
    content = json.dumps(dataRecent)
    for nodeRecent in nodesRecent:
        index = nodesRecent.index(nodeRecent)
        if nodeRecent["category"].endswith("WithinRectangle"):
            nodeRecent["category"]=nodeRecent["category"].replace("WithinRectangle","")
        else :
            nodeRecent["category"] = nodeRecent["category"] + "NotConsider"
        nodesRecent[index] = nodeRecent
    dataRecent["nodeDataArray"] = nodesRecent
    sqlAdd = contentConvertor(json.dumps(dataRecent),"PostgreSQL", "withoutView")
    sqlAdd= "<br>".join(sqlAdd.split("\n"))
    return render(request, 'blog/compare.html', {'titleOld': versionOld.title, 'titleRecent': versionRecent.title,'sqlAdd': sqlAdd,'content': content})



def about(request):
    return render(request, 'blog/about.html')

def tutorials(request):
    return render(request, 'blog/tutorials.html')