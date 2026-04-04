import { NextResponse } from 'next/server';

export async function POST() {
	return NextResponse.json(
		{ error: 'This endpoint is deprecated. Please use /api/sarvam/chat.' },
		{ status: 410 }
	);
}

