import {Alert,Goods,Shipment} from '../models.js';import {io} from '../index.js';
export async function evaluateReading(reading,device){
 const shipment=await Shipment.findById(device.shipment).populate('goods');if(!shipment?.goods)return;
 const g=shipment.goods, violations=[];
 if(reading.temperature<g.minTemperature)violations.push({type:'temperature_low',message:`Temperature ${reading.temperature}°C below ${g.minTemperature}°C`});
 if(reading.temperature>g.maxTemperature)violations.push({type:'temperature_high',message:`Temperature ${reading.temperature}°C above ${g.maxTemperature}°C`});
 if(reading.humidity<g.minHumidity)violations.push({type:'humidity_low',message:`Humidity ${reading.humidity}% below ${g.minHumidity}%`});
 if(reading.humidity>g.maxHumidity)violations.push({type:'humidity_high',message:`Humidity ${reading.humidity}% above ${g.maxHumidity}%`});
 for(const v of violations){const key=`${device._id}:${v.type}`;const existing=await Alert.findOne({conditionKey:key,active:true});if(existing){existing.lastTriggeredAt=new Date();await existing.save();continue;}
  const severity=(v.type.includes('temperature')&&Math.abs(reading.temperature-(v.type.endsWith('high')?g.maxTemperature:g.minTemperature))>5)||(v.type.includes('humidity')&&Math.abs(reading.humidity-(v.type.endsWith('high')?g.maxHumidity:g.minHumidity))>20)?'Critical':'Medium';
  const alert=await Alert.create({shipment:shipment._id,device:device._id,type:v.type,severity,message:v.message,conditionKey:key,lastTriggeredAt:new Date()});io.emit('alert:new',alert);
 }
 // Close condition-specific alerts after a reading returns within range.
 const active=await Alert.find({device:device._id,active:true});for(const a of active){const still=violations.some(v=>v.type===a.type);if(!still){a.active=false;a.resolvedAt=new Date();await a.save();}}
}
