import jwt from 'jsonwebtoken';
import {User} from './models.js';
export async function auth(req,res,next){try{const token=(req.headers.authorization||'').replace(/^Bearer /,'');if(!token) return res.status(401).json({message:'Authentication required'});const p=jwt.verify(token,process.env.JWT_SECRET);req.user=await User.findById(p.id);if(!req.user)return res.status(401).json({message:'Invalid user'});next();}catch{return res.status(401).json({message:'Invalid or expired token'});}}
export const allow=(...roles)=>(req,res,next)=>roles.includes(req.user.role)?next():res.status(403).json({message:'Insufficient permissions'});
export const asyncRoute=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
