import express from "express";
import zod from "zod";
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const app=express();
app.use(express.json())

const UserSchema=zod.object({
    username:zod.string().min(6),
    email:zod.string().email()
})

const TodoSchema=zod.object({
    title:zod.string(),
    description:zod.string(),
    userId:zod.number()
})

app.get("/",async (req,res)=>{
    const userId=req.body.userId;

    const allTodos=await prisma.todo.findMany({
        where:{
            userId:userId
        }
    })

    const user=await prisma.user.findFirst({
        where:{
            id:userId
        }
    })
    res.json({allTodos,user});
})

app.post('/user',async (req,res)=>{
    const {success}=UserSchema.safeParse(req.body);
    type userDataType=zod.infer<typeof UserSchema>;

    if(success){
        const userdata:userDataType=req.body;

        const createdUser=await prisma.user.create({
            data:{
                username:userdata.username,
                email:userdata.email
            }
        })
        res.json(createdUser);
    }
    else{
        res.json({
            message:"invalid Input"
        })
    }

})

app.post("/todo",async (req,res)=>{
    const {success}=TodoSchema.safeParse(req.body);
    if(success){
        type TodoDataType=zod.infer<typeof TodoSchema>;
        const TodoData:TodoDataType=req.body;
        try{
            const createdTodo=await prisma.todo.create({
                data:{
                    title:TodoData.title,
                    description:TodoData.description,
                    userId:TodoData.userId
                }
            })
    
            res.json(createdTodo);
        }
        catch(err){
            res.json({message:"invalid user id"});
        }
        
    }
    else{
        res.json({
            message:"invalid input"
        })
    }
})

app.listen(3000,()=>{
    console.log("server started at port 3000");
})