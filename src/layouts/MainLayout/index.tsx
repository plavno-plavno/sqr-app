import { PropsWithChildren } from "react"
import {Select} from "antd";
import {languageOptions} from "../../constants/languages";
import {promptOptions} from "../../constants/prompt";
import s from './styles.module.scss';

interface MainLayoutProps {
  language: string;
  prompt: string;
  isSocketActive: boolean;
  onLanguageChange: (lang: string) => void;
  onPromptChange: (prompt: string) => void;
}

export const MainLayout = ({
  children,
  language,
  prompt,
  isSocketActive,
  onLanguageChange,
  onPromptChange,
}: PropsWithChildren<MainLayoutProps>) => {
  return (
    <main className={s.MainLayoutWrapper}>
      <div className={s.MainLayoutWrapper_Header}>
        <div
          style={{
            display: 'flex',
            gap: '1rem',
          }}
        >
          <Select
            value={language}
            onChange={onLanguageChange}
            options={languageOptions}
            className={s.languageSelector}
            style={{ width: 120 }}
            styles={{
              popup: {
                root: {
                  background: '#000000',
                  color: '#ffffff',
                  border: '1px solid #ffffff',
                },
              }
            }}
          />
          <Select
            value={prompt}
            onChange={onPromptChange}
            options={promptOptions}
            className={s.languageSelector}
            style={{ width: 120 }}
            styles={{
              popup: {
                root: {
                  background: '#000000',
                  color: '#ffffff',
                  border: '1px solid #ffffff',
                },
              }
            }}
          />
        </div>
      </div>
      <div className={s.MainLayoutWrapper_Content}>{children}</div>
      <div className={s.MainLayoutWrapper_Footer}/>
    </main>
  )
}
