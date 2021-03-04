class knot:
    def __init__(self, id, mnemonic, name, dataName, dataType):
        self.id = id
        self.mnemonic = mnemonic
        self.name=name
        self.dataName=dataName
        self.dataType= dataType

    def toSQL(self):
        sql='CREATE TABLE IF NOT EXISTS '+self.mnemonic+'_'+self.name+' (\n '+self.id+' INT NOT NULL PRIMARY KEY,\n ' \
          +self.dataName +' '+self.dataType+'\n ); \n'
        return sql