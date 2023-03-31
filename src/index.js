const express = require("express");
const {v4: uuidv4} = require("uuid"); // gera id por um número randômico; identificador único universal 
const app = express();
app.use(express.json());

const customers = []; //banco de dados fake

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


    
app.listen(3333);
