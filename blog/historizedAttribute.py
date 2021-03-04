class historizedAttribute:
    def __init__(self, mnemonic, name, dataName, dataType, anchorID, anchorMnemonic, anchorName, knotID, knotMnemonic,knotName):
        self.mnemonic = mnemonic
        self.name = name
        self.dataName = dataName
        self.dataType = dataType
        self.anchorID = anchorID
        self.anchorMnemonic = anchorMnemonic
        self.anchorName = anchorName
        self.knotID = knotID
        self.knotMnemonic = knotMnemonic
        self.knotName = knotName

    def toSQL(self):
        sql = 'CREATE TABLE IF NOT EXISTS ' + self.mnemonic + '_' + self.name + '  (\n ' + self.anchorID + ' INT NOT NULL,' \
        '\n FOREIGN KEY ('+ self.anchorID +') REFERENCES ' + self.anchorMnemonic + '_' + self.anchorName + ' (' + self.anchorID +'),\n '

        if self.knotID != "":
            sql = sql + self.knotName + ' INT ,\n FOREIGN KEY ('+ self.knotName+') REFERENCES ' + self.knotMnemonic + '_'+ self.knotName + ' (' + self.knotID + '),'
        else:
            sql = sql + self.dataName + ' ' + self.dataType + ','

        sql = sql +'\n'+self.mnemonic+'_ValidFrom DATE NOT NULL, \n ' \
         'PRIMARY KEY ('+self.anchorID +', '+ self.mnemonic+'_ValidFrom)\n'
        return sql+' );\n'
