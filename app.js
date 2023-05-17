require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require ('bcrypt')
const jwt = require('jsonwebtoken')
const cors = require('cors')


const app = express()

app.use(cors(origin= '*'))


//Config JSON response
app.use(express.json())

// Models
const User = require('./models/User')
const Book = require('./models/Book')


//---------------------------------------------------ROUTES-----------------------------------------------------------------------------


// Public Route -------------------------------------------------------------------------------------------------
app.get('/', (req,res) => {
    res.status(200).json({msg: "Acesso confirmado"})
})


// Private Route ------------------------------------------------------------------------------------------------
app.get("/user/:id",checkToken, async(req,res)=> {

    const id = req.params.id

    //check if user exists
    const user = await User.findById(id, '-password')

    if(!user){
        return res.status(404).json({msg: 'Usuário não encontrado'})
    }

    res.status(200).json({user})
})


// Check Token Middleware ---------------------------------------------------------------------------------------
function checkToken(req,res,next){

    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(" ")[1]

    if(!token){
        return res.status(401).json({msg: "Acesso negado"})
    }

    try{
        const secret = process.env.SECRET

        jwt.verify(token, secret)

        next()

    } catch(err){

        res.status(400).json({msg: "Token Inválido"})

    }
}


// User Register Route ------------------------------------------------------------------------------------------
app.post('/auth/register',async(req,res) => {

    const {name, ra,  email, password, role} = req.body

    // Validations
    if(!name){
        return res.status(422).json({msg: "O nome é obrigatório!"})
    }
    if(!ra){
        return res.status(422).json({msg: "O ra é obrigatório!"})
    }
    if(!email){
        return res.status(422).json({msg: "O email é obrigatório!"})
    }
    if(!password){
        return res.status(422).json({msg: "A senha é obrigatória!"})
    }
    if(!role){
        return res.status(422).json({msg: "A função é obrigatória!"})
    }



    // Check if user exists
    const emailExists = await User.findOne({email: email })
    const raExists = await User.findOne({ ra:ra })

    if(emailExists & raExists){
        return res.status(422).json({msg: 'Por favor, utilize outro e-mail e outro ra'})
    }
    else if(emailExists){
        return res.status(422).json({msg: 'Por favor, utilize outro e-mail'})
    }
    else if(raExists){
        return res.status(422).json({msg: 'Por favor, utilize outro ra'})
    }

    // Password Hash
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    state = "pendente"
    
    const user = new User({
        name,
        ra,
        email,
        password: passwordHash,
        role,
        state
    })

    

    try{

        await user.save()
        res.status(201).json({msg:"Usuário criado com sucesso!"})

    }catch(error){
        res.status(500).json({msg: 'Aconteceu um erro, tente novamente mais tarde'})

    }
    
})


// Login User Route ---------------------------------------------------------------------------------------------
app.post("/auth/login", async(req,res) => {

    const{email,password} = req.body

    //Validations
    if(!email){
        return res.status(422).json({msg: "O email é obrigatório!"})
    }
    if(!password){
        return res.status(422).json({msg: "A senha é obrigatória!"})
    }

    //Check if user exists
    const user = await User.findOne({email: email })

    if(!user){
        return res.status(404).json({msg: 'Usuário não encontrado'})
    }

    //Check password
    const checkPassword = await bcrypt.compare(password,user.password)

    if(!checkPassword){
        return res.status(422).json({msg: 'Senha inválida'})
    }

    //User token
    try{

        const secret = process.env.SECRET

        const token = jwt.sign({
            id: user._id,
        },
        secret,
        )

        id = user._id

        res.status(200).json({msg: "Autenticação realizada com sucesso", token , id })

    }catch(err){
        res.status(500).json({msg: 'Aconteceu um erro, tente novamente mais tarde'})
    }

})


// Book register Route ------------------------------------------------------------------------------------------
app.post("/books/insert", async(req,res) => {

    const {isbn, title,  author, amount} = req.body

    if(!isbn){
        return res.status(422).json({msg: "O Código ISBN é obrigatório!"})
    }
    if(!title){
        return res.status(422).json({msg: "O Titulo é obrigatório!"})
    }
    if(!author){
        return res.status(422).json({msg: "O Autor é obrigatório!"})
    }
    if(!amount || amount < 0){
        return res.status(422).json({msg: "A quantidade inválida"})
    }

    const isbnExists = await Book.findOne({isbn: isbn })

    if(isbnExists){
         return res.status(422).json({msg: 'isbn já cadastrado'})
     }

    const book = new Book({
        isbn, 
        title,  
        author, 
        amount
    })
    

    try{

        await book.save()
        res.status(201).json({msg:"Livro cadastrado com sucesso!"})

    }catch(error){
        res.status(500).json({msg: 'Aconteceu um erro, tente novamente mais tarde'})

    }

})


// Book List Route ----------------------------------------------------------------------------------------------
app.get("/books/list",async(req,res) => {
    const books = await Book.find()
    res.send({data : books})




})

// Book Update Route --------------------------------------------------------------------------------------------
app.patch("/books/update/:id", async(req,res) => {

    const {isbn, title,  author, amount} = req.body

    try{
    const book = await Book.findById(req.params.id)
    Object.assign(book, req.body)
    book.save()
    res.send({data:book})
    } catch(err){
        res.status(404).send({msg: "Livro não encontrado!"})
    }


})

// Book Delete Route --------------------------------------------------------------------------------------------
app.delete("/books/delete/:id", async(req,res) => {

    const book = await Book.findById(req.params.id)

    try{

        await book.deleteOne()
        res.send({data: true})

        } catch(err){
            res.status(404).send({msg: "Livro não encontrado"})
        }

})
//---------------------------------------------------ROUTES ENDING------------------------------------------------------------------------


// Credenciais
const dbUser = process.env.DB_USER
const dbPass = process.env.DB_PASS

mongoose.connect(`mongodb+srv://${dbUser}:${dbPass}@cluster0.zq6ip79.mongodb.net/?retryWrites=true&w=majority`).then(()=>{
    app.listen(3000)
    console.log("Conectado ao Banco")
}).catch((err)=>console.log(err))

