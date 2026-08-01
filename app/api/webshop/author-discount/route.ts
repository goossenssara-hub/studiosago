import { NextResponse } from "next/server";
import { calculateTextCorrectionPrice } from "@/lib/textCorrection";
import { applyAuthorDiscount } from "@/lib/authorDiscount";
export const runtime="nodejs";export async function POST(request:Request){const body=await request.json();const words=Number(body.wordCount||0);if(words<10000)return NextResponse.json({valid:false,error:"De auteurskorting geldt vanaf 10.000 woorden."},{status:400});const base=calculateTextCorrectionPrice(words);const result=applyAuthorDiscount(base,words,body.code);if(!result.eligible)return NextResponse.json({valid:false,error:"Deze Instagramcode is niet geldig."},{status:400});return NextResponse.json({valid:true,discountPercent:result.percent,finalAmount:result.amount,baseAmount:base});}
