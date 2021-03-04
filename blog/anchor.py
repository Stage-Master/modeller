class anchor:
    def __init__(self, id,mnemonic, name):
        self.id = id
        self.mnemonic = mnemonic
        self.name=name

    def toSQL(self):
        sql='CREATE TABLE IF NOT EXISTS '+self.mnemonic+'_'+self.name+' (\n '+self.id+' INT NOT NULL PRIMARY KEY \n);\n'
        return sql