import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const headersList: Record<string, string> = {}
  request.headers.forEach((value, key) => {
    headersList[key] = value
  })

  return NextResponse.json({
    url: request.url,
    headers: headersList,
  })
}
