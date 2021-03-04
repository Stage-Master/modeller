from django.urls import path, re_path
from . import views

urlpatterns = [
    path('',views.home, name="home"),
    path('modeller/<id>/<title>',views.modeller, name="modeller"),
    path('modellerFromVersion/<id>', views.modellerFromVersion, name="modellerFromVersion"),
    path('compare/<idOld>/<idRecent>', views.compare, name="compare"),
    path('modellerFromVersionSave', views.modellerFromVersionSave, name="modellerFromVersionSave"),
    path('createModel/<id>', views.createModel, name="createModel"),
    path('createSuperModel/<id>', views.createSuperModel, name="createSuperModel"),
    path('deleteModel/<id>/<modelID>', views.deleteModel, name="deleteModel"),
    path('deleteSuperModel/<id>', views.deleteSuperModel, name="deleteSuperModel"),
    path('copyModel/<title>/<content>/<modelID>', views.copyModel, name="copyModel"),
    path('renameModel/<id>', views.renameModel, name="renameModel"),
    path('renameSuperModel', views.renameSuperModel, name="renameSuperModel"),
    path('loadModel', views.loadModel, name="loadModel"),
    path('loadModelVersions/<id>', views.loadModelVersions, name="loadModelVersions"),
    path('importModel', views.importModel, name="importModel"),
    path('sqlConvertor',views.SQLConvertor, name="sqlConvertor"),
    path('jsonConvertor', views.JSONConvertor, name="jsonConvertor"),
    path('about',views.about, name="about"),
    path('tutorials', views.tutorials, name="tutorials"),

]
