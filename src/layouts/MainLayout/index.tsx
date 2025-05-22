import { PropsWithChildren } from "react"
import s from './styles.module.scss';

export const MainLayout = ({children}: PropsWithChildren) => {
  return (
    <main className={s.MainLayoutWrapper}>
      <div className={s.MainLayoutWrapper_Header}/>
      <div className={s.MainLayoutWrapper_Content}>{children}</div>
      <div className={s.MainLayoutWrapper_Footer}/>
    </main>
  )
}
