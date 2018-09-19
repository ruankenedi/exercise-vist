//1. Inicialização

var localDB = null;

function onInit(){
    try {
        if (!window.openDatabase) {
            updateStatus("Erro: Seu navegador não permite banco de dados.");
        }
        else {
            initDB();
            createTables();
            queryAndUpdateOverview();
        }
    } 
    catch (e) {
        if (e == 2) {
            updateStatus("Erro: Versão de banco de dados inválida.");
        }
        else {
            updateStatus("Erro: Erro desconhecido: " + e + ".");
        }
        return;
    }
}

function initDB(){
    var shortName = 'Vistoria';
    var version = '1.0';
    var displayName = 'MyVistoriaDB';
    var maxSize = 65536; // Em bytes
    localDB = window.openDatabase(shortName, version, displayName, maxSize);
}

function createTables(){
    var predios = 'CREATE TABLE IF NOT EXISTS predio(idPredio INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, nome VARCHAR NOT NULL, localizacao VARCHAR NOT NULL);';
    var apartamentos = 'CREATE TABLE IF NOT EXISTS apartamento(idApartamento INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, nome VARCHAR NOT NULL, localizacao VARCHAR NOT NULL, idPredio_predios INTEGER NOT NULL, FOREIGN KEY(idPredio_predios) REFERENCES predio(idPredio));';
    var tipologia = 'CREATE TABLE IF NOT EXISTS tipologia(idTipologia INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, nome VARCHAR NOT NULL)';
    var perfil = 'CREATE TABLE IF NOT EXISTS perfil(idPerfil INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, nome VARCHAR NOT NULL)';
    try {
        localDB.transaction(function(transaction) {
            transaction.executeSql(predios, [], nullDataHandler, errorHandler);
            updateStatus("Tabela 'predios' status: OK.");
        });

        localDB.transaction(function(transaction) {
            transaction.executeSql(apartamentos, [], nullDataHandler, errorHandler);
            updateStatus("Tabela 'apartamentos' status: OK.");
        });

        localDB.transaction(function(transaction) {
            transaction.executeSql(tipologia, [], nullDataHandler, errorHandler);
            updateStatus("Tabela 'tipologia' status: OK.");
        });

        localDB.transaction(function(transaction) {
            transaction.executeSql(perfil, [], nullDataHandler, errorHandler);
            updateStatus("Tabela 'perfil' status: OK.");
        });
    } 
    catch (e) {
        updateStatus("Erro: Data base 'Vistoria' não criada " + e + ".");
        return;
    }
}

//2. Query e visualização de Update
function onUpdate(){
    var id = document.itemForm.id.value;
    console.log('ID onUpdate: ', id);
    var predio = document.itemForm.predio.value;
    var localizacao = document.itemForm.localizacao.value;
    console.log('Localização: ', localizacao);
    if (predio == "" || localizacao == "") {
        updateStatus("'Prédio' e 'Localização' são campos obrigatórios!");
    }
    else {
        var query = "update predio set nome=?, localizacao=? where idPredio=?;";
        try {
            localDB.transaction(function(transaction){
                transaction.executeSql(query, [predio, localizacao, id], function(transaction, results){
                    if (!results.rowsAffected) {
                        updateStatus("Erro: Update não realizado.");
                    }
                    else {
                        updateForm("", "", "");
                        updateStatus("Update realizado: " + results.rowsAffected);
                        queryAndUpdateOverview();
                    }
                }, errorHandler);
            });
        } 
        catch (e) {
            updateStatus("Erro: UPDATE não realizado " + e + ".");
        }
    }
}

// function onDelete(){
//     var id = document.itemForm.id.value;
    
//     var query = "ALTER TABLE vilourenco AUTO_INCREMENT = 1;";
//     // var teste = "ALTER TABLE vilourenco AUTO_INCREMENT = 1;";
//     try {
//         localDB.transaction(function(transaction){
        
//             transaction.executeSql(query, [id], function(transaction, results){
//                 if (!results.rowsAffected) {
//                     updateStatus("Erro: Delete não realizado.");
//                 }
//                 else {
//                     updateForm("", "", "");
//                     updateStatus("Linhas deletadas:" + results.rowsAffected);
                    
//                     queryAndUpdateOverview();
//                 }
//             }, errorHandler);
//         });
//     } 
//     catch (e) {
//         updateStatus("Erro: DELETE não realizado " + e + ".");
//     }
    
// }

function onCreate(){
    var predios = document.itemForm.predio.value;
    console.log('Predios onCreate: ', predios);
    var localizacao = document.itemForm.localizacao.value;
    console.log('Localização onCreate: ', localizacao);
    // var nome = document.itemForm.nome.value;
    // var apartamento = document.itemForm.apartamento.value;
    // var tipologia = document.itemForm.tipologia.value;
    // var perfil = document.itemForm.perfil.value;
    // var idade = document.itemForm.idade.value;

    // || apartamento == "" || tipologia == "" || perfil == ""
    if (predios == "" || localizacao == "") {
        updateStatus("Erro: 'Prédio' e 'Localização' são campos obrigatórios!");
    }
    else {
        var query = "insert into predio(nome, localizacao) VALUES (?, ?);";
        try {
            localDB.transaction(function(transaction){
                // , apartamento, tipologia, perfil
                transaction.executeSql(query, [predios, localizacao], function(transaction, results){
                    if (!results.rowsAffected) {
                        updateStatus("Erro: Inserção não realizada");
                    }
                    else {
                        updateForm("", "", "");
                        updateStatus("Inserção realizada, linha id: " + results.insertId);
                        queryAndUpdateOverview();
                    }
                }, errorHandler);
            });
        } 
        catch (e) {
            updateStatus("Erro: INSERT não realizado " + e + ".");
        }
    }
}

function onSelect(htmlLIElement){
    var id = htmlLIElement.getAttribute("id");
    console.log('ID: ', htmlLIElement);
	
	query = "SELECT * FROM predio where idPredio=?;";
    try {
        localDB.transaction(function(transaction){
        
            transaction.executeSql(query, [id], function(transaction, results){
            
                var row = results.rows.item(0);
                
                updateForm(row['idPredio'], row['nome'], row['localizacao']);
                
            }, function(transaction, error){
                updateStatus("Erro: " + error.code + "<br>Mensagem: " + error.message);
            });
        });
    } 
    catch (e) {
        updateStatus("Error: SELECT não realizado " + e + ".");
    }
   
}

function queryAndUpdateOverview() {

	//Remove as linhas existentes para inserção das novas
    var dataRows = document.getElementById("itemData").getElementsByClassName("data");
	
    while (dataRows.length > 0) {
        row = dataRows[0];
        document.getElementById("itemData").removeChild(row);
    };
    
	//Realiza a leitura no banco e cria novas linhas na tabela.
    var query = "SELECT * FROM predio;";
    try {
        localDB.transaction(function(transaction){
        
            transaction.executeSql(query, [], function(transaction, results){
                for (var i = 0; i < results.rows.length; i++) {

                    var row = results.rows.item(i);
                    var li = document.createElement("li");
                    
					li.setAttribute("id", row['idPredio']);
                    li.setAttribute("class", "data");
                    li.setAttribute("onclick", "onSelect(this)");
                    
                    var liText = document.createTextNode(row['nome'] + " x " + row['localizacao']);
                    li.appendChild(liText);
                    
                    document.getElementById("itemData").appendChild(li);
                }
            }, function(transaction, error){
                updateStatus("Erro: " + error.code + "<br>Mensagem: " + error.message);
            });
        });
    } 
    catch (e) {
        updateStatus("Error: SELECT não realizado " + e + ".");
    }
}

// 3. Funções de tratamento e status.

// Tratando erros

errorHandler = function(transaction, error){
    updateStatus("Erro: " + error.message);
    return true;
}

nullDataHandler = function(transaction, results){
}

// Funções de update

function updateForm(id, apartamento, predio, localizacao, tipologia, perfil){
    document.itemForm.id.value = id;
    // document.itemForm.nome.value = apartamento;
    document.itemForm.predio.value = predio;
    document.itemForm.localizacao.value = localizacao;
    // document.itemForm.tipologia.value = tipologia;
    // document.itemForm.perfil.value = perfil;
}

function updateStatus(status){
    document.getElementById('status').innerHTML = status;
}