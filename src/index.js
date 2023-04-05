const express = require("express");
const {v4: uuidv4} = require("uuid"); // gera id por um número randômico; identificador único universal 
const app = express();
app.use(express.json());

const customers = []; //banco de dados fake

//Middleware: função entre o request e o response
function verifyIfExistsAccountsCPF (request, response, next){
    const {cpf} = request.headers; //recebe o valor por header no insomnia
    // find retorna o conteúdo
    const customer = customers.find((customer) => customer.cpf === cpf); 

    if(!customer){
        return response.status(400).json({error : "Customer not found"});
    } else {
        request.customer = customer; //repassa customer para quem utilizar o middleware
        return next(); //executa o código
    };

};
//verificar saldo
function getBalance(statement){
    //tranforma os valores em um só
    //acc-> acumulador dos valores e operation -> soma/subtração dos saques e depósitos
    const balance = statement.reduce((acc, operation) => {
        if(operation.type === "credit"){
            return acc + operation.amount;
        }
        else {
            return acc - operation.amount;
        };
    },0);//valor que inicia o reduce

    return balance
};

app.post("/account", (request, response) => {
    const { cpf,name } = request.body;
    //some retorna verdadeiro ou falso, existe ou não
    const customerAlreadyExists = customers.some(
        (customer) => customer.cpf === cpf
        );

    if(customerAlreadyExists){
        return response.status(400).json({error: "Customer already exists!"});
    };

    customers.push({ //inserir dados na array
        cpf,
        name,
        id: uuidv4(),
        statement: []
    });
    return response.status(201).send();
});

//app.use(verifyIfExistsAccountCPF); quando tudo que estiver abaixo for usar o middleware

app.get("/statement", verifyIfExistsAccountsCPF, (request, response) => {
    const {customer} = request; //recupera a info; desestrutura customer de dentro do request
    return response.json(customer.statement);
});
    
app.post("/deposit",verifyIfExistsAccountsCPF, (request, response) => {
    const {description, amount} = request.body;
    const {customer} = request;
    //dados da operação do tipo credito
    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: "credit"
    };
    //inserir na lista do banco de dados
    customer.statement.push(statementOperation);

    return response.status(201).send();
});

app.post("/withdraw", verifyIfExistsAccountsCPF, (request, response) =>{
    //recuperar o valor do saque
    const {amount} = request.body;
    const {customer} = request;
    //verificar se o saldo é suficiente
    const balance = getBalance(customer.statement);

    if(balance < amount){
        return response.status(400).json({error : "Insufficient funds!"});
    }
    //atualizar a info na array
    const statementOperation = {
        amount,
        created_at: new Date(),
        type: "debit"
    };
    customer.statement.push(statementOperation);

    return response.status(201).send();
    
});

app.get("/statement/date", verifyIfExistsAccountsCPF, (request, response) => {
    const {customer} = request; //recupera a info; desestrutura customer de dentro do request
    const {date} = request.query; //parametro da rota

    //formatar a data para qualquer horario do dia
    const dateFormat = new Date(date + " 00:00");

    //filtro pra retornar o statement do dia; tranformar as datas em string (10/10/2021) e comparar
    const statement = customer.statement.filter(
        (statement) =>
         statement.created_at.toDateString() === 
         new Date(dateFormat).toDateString() 
    );

    return response.json(statement);
});

app.put("/account", verifyIfExistsAccountsCPF, (request, response) =>{ 
    const {name} = request.body; 
    const {customer} = request;

    customer.name = name;

    return response.status(201).send();
});

app.get("/account", verifyIfExistsAccountsCPF, (request, response) => {
    const {customer} = request;

    return response.json(customer);
});

app.delete("/account", verifyIfExistsAccountsCPF, (request, response) => {
    const {customer} = request;

    //método splice(onde começa, quantas posições da lista irá remover)
    customers.splice(customer, 1);
    // o certo seria retornar 204 de sucesso
    return response.status(200).json(customers);
});
app.listen(3333);
