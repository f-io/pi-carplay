import { ReactNode } from 'react'
import { Nav } from '../navigation'
import { useCarplayStore } from '@store/store'

export const AppLayout = ({ children, navRef, receivingVideo }: { children: ReactNode }) => {
  const settings = useCarplayStore((s) => s.settings)

  return (
    <div style={{ height: '100%', touchAction: 'none' }} id="main" className="App">
      <div ref={navRef} id="nav-root">
        <Nav receivingVideo={receivingVideo} settings={settings} />
      </div>

      {children}
    </div>
  )
}
