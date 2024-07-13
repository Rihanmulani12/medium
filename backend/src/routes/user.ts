import { Hono } from 'hono';
import { sign} from 'hono/jwt'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'


export const userRouter = new Hono<{
    Bindings: {
      DATABASE_URL: string;
      JWT_SECRET: string;
    }
  }>();

  userRouter.post('/signup', async(c) => {

    const body = await c.req.json()
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
  
   try {
    
    const user = await prisma.user.create({
      data: {
       username : body.username,
       password : body.password,
       name : body.name
      }
    })
  
    const jwt = await sign({id : user.id}, c.env.JWT_SECRET)
    return c.json({jwt})
  
   } catch (error) {
     c.status(411)
     return c.text("singup failed")
   }
  
  })
  

  userRouter.post('/signin', async(c) => {
  
    const body = await c.req.json()
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
  
   try {
    
    const user = await prisma.user.findFirst({
      where : {
        username : body.username,
        password : body.password
      }
      
      })
  
      if(!user){
        c.status(403)
        return c.text("invalid credentials")
      }
    const jwt = await sign({id : user.id}, c.env.JWT_SECRET)
    return c.json({jwt})
  
   } catch (error) {
     c.status(411)
     return c.text("singin failed")
   }
  })


  export default userRouter;