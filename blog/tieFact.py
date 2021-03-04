class tieFact:
    def __init__(self, mnemonic, name, listAnchor, measure, measureType):
        self.mnemonic = mnemonic
        self.name = name
        self.listAnchor=listAnchor
        self.measure = measure
        self.measureType = measureType

    def toSQL(self):
        sql='CREATE TABLE IF NOT EXISTS '+self.mnemonic+'_'+self.name+' (\n'\
            +self.measure+' '+self.measureType+',\n'
        for anchor in self.listAnchor:
            sql = sql + anchor['ID'] + ' INT NOT NULL,\n ' \
                  + 'FOREIGN KEY (' + anchor['ID'] + ' ) ' \
                  + 'REFERENCES ' + anchor['Mnemonic'] + '_' + anchor['Name'] + ' (' + anchor['ID'] + '),\n'
        sql = sql + 'PRIMARY KEY ('
        for anchor in self.listAnchor:
            if anchor == self.listAnchor[-1]:
                sql = sql + anchor['ID'] + ')\n'
            else:
                sql = sql + anchor['ID'] + ','

        return sql + ' );\n'