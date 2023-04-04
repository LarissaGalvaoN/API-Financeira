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
app.listen(3333);
