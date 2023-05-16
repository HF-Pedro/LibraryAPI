async function teste1 (req,res){

    const User = require('./models/User')

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
}