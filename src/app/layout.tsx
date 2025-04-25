import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Image from 'next/image'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Bandadle - Daily Before and After Word Game',
  description: 'A daily game of before and after puzzles. Solve all the clues before time runs out!',
  icons: {
    icon: '/favicon.ico'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ margin: 0, padding: 0, backgroundColor: 'rgb(242, 236, 215)' }}>
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          flexDirection: 'column' 
        }}>
          <header style={{ 
            backgroundColor: 'rgb(31, 70, 57)', 
            color: 'white', 
            padding: '0.5rem 0', 
            boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ 
              maxWidth: '1280px', 
              margin: '0 auto', 
              padding: '0 0.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Image 
                  src="/logo.png" 
                  alt="Bandadle Logo" 
                  width={40} 
                  height={40} 
                  style={{ 
                    marginRight: '0.5rem',
                    borderRadius: '4px'
                  }}
                />
                <div>
                  <h1 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold', 
                    textAlign: 'center',
                    margin: '0',
                    color: 'rgb(242, 236, 215) !important'
                  }}>
                    Bandadle
                  </h1>
                  <p style={{ 
                    fontSize: '0.75rem', 
                    textAlign: 'center', 
                    color: 'rgb(242, 236, 215)',
                    opacity: 0.8,
                    margin: 0
                  }}>
                    Daily Before & After Word Game
                  </p>
                </div>
              </div>
              <div id="headerMenuContainer" className="dropdown-container"></div>
            </div>
          </header>
          <main style={{ 
            flexGrow: 1, 
            maxWidth: '1280px', 
            margin: '0 auto', 
            padding: '0.5rem'
          }}>
            {children}
          </main>
          <footer style={{ 
            backgroundColor: 'rgba(31, 70, 57, 0.1)', 
            padding: '0.375rem 0', 
            borderTop: '1px solid rgba(31, 70, 57, 0.2)' 
          }}>
            <div style={{ 
              maxWidth: '1280px', 
              margin: '0 auto', 
              padding: '0 0.5rem', 
              textAlign: 'center', 
              color: 'rgb(31, 70, 57)', 
              fontSize: '0.75rem' 
            }}>
              <div>&copy; {new Date().getFullYear()} Bandadle</div>
              <div style={{ marginTop: '0.25rem' }}>
                Created by Zachary Wand - <a href="mailto:z.wand19@gmail.com" style={{ color: 'rgb(31, 70, 57)', textDecoration: 'none', fontWeight: 'bold' }}>z.wand19@gmail.com</a>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
