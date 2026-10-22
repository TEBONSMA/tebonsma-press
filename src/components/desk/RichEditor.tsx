import { useRef, useState } from 'react'
import Image from '@tiptap/extension-image'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Underline,
  Undo2,
  type LucideIcon,
} from 'lucide-react'
import { apiUrl, errorMessage } from '../../lib/api'
import { toJpeg } from '../../lib/image'
import { uploadImage } from '../../lib/press'

interface ToolProps {
  label: string
  icon: LucideIcon
  active?: boolean
  disabled?: boolean
  onClick: () => void
}

const Tool = ({ label, icon: Icon, active, disabled, onClick }: ToolProps) => (
  <button
    type="button"
    // Keeps the selection in the text while the button is pressed
    onMouseDown={e => e.preventDefault()}
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    title={label}
    aria-pressed={active}
    className={`rounded p-2 transition-colors disabled:opacity-40 ${active ? 'bg-ink text-paper' : 'text-ink hover:bg-soft'}`}
  >
    <Icon size={17} aria-hidden="true" />
  </button>
)

// The article's text, with the formatting an article may have (what the API lets through):
// headings, bold, italic, underline, links, quotes, lists, lines and the paper's own pictures
export default function RichEditor({ token, initialHtml, onChange }: { token: string; initialHtml: string; onChange: (html: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        link: { openOnClick: false, autolink: true, protocols: ['http', 'https', 'mailto'] },
      }),
      Image,
    ],
    // Pictures are kept as /press/images/<id>; in the editor they need the API's address
    content: initialHtml.replace(/src="\/press\/images\//g, `src="${apiUrl('/press/images/')}`),
    onUpdate: ({ editor: updated }) => onChange(updated.getHTML()),
    editorProps: {
      attributes: {
        'aria-label': 'Brødtekst',
        class: 'article-body px-5 py-4',
      },
    },
  })

  const active = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      h2: !!current?.isActive('heading', { level: 2 }),
      h3: !!current?.isActive('heading', { level: 3 }),
      bold: !!current?.isActive('bold'),
      italic: !!current?.isActive('italic'),
      underline: !!current?.isActive('underline'),
      link: !!current?.isActive('link'),
      quote: !!current?.isActive('blockquote'),
      bullet: !!current?.isActive('bulletList'),
      ordered: !!current?.isActive('orderedList'),
      undo: !!current?.can().undo(),
      redo: !!current?.can().redo(),
    }),
  })

  if (!editor || !active) return <div className="min-h-[24rem] rounded-md border border-line" />

  const setLink = () => {
    const previous = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('Lenke (tom for å fjerne):', previous ?? 'https://')
    if (url === null) return
    if (!url.trim() || url.trim() === 'https://') editor.chain().focus().extendMarkRange('link').unsetLink().run()
    else editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run()
  }

  const addPicture = async (file: File) => {
    setUploading(true)
    setError(null)
    try {
      const { url } = await uploadImage(token, await toJpeg(file))
      editor.chain().focus().setImage({ src: apiUrl(url), alt: '' }).run()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="rounded-md border border-line">
      <div className="sticky top-0 z-10 flex flex-wrap gap-0.5 border-b border-line bg-paper/95 p-1 backdrop-blur" role="toolbar" aria-label="Formatering">
        <Tool label="Mellomtittel" icon={Heading2} active={active.h2} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
        <Tool label="Undertittel" icon={Heading3} active={active.h3} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
        <span className="mx-1 w-px self-stretch bg-line" />
        <Tool label="Fet" icon={Bold} active={active.bold} onClick={() => editor.chain().focus().toggleBold().run()} />
        <Tool label="Kursiv" icon={Italic} active={active.italic} onClick={() => editor.chain().focus().toggleItalic().run()} />
        <Tool label="Understrek" icon={Underline} active={active.underline} onClick={() => editor.chain().focus().toggleUnderline().run()} />
        <Tool label="Lenke" icon={Link2} active={active.link} onClick={setLink} />
        <span className="mx-1 w-px self-stretch bg-line" />
        <Tool label="Sitat" icon={Quote} active={active.quote} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
        <Tool label="Punktliste" icon={List} active={active.bullet} onClick={() => editor.chain().focus().toggleBulletList().run()} />
        <Tool label="Nummerert liste" icon={ListOrdered} active={active.ordered} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
        <Tool label="Skillelinje" icon={Minus} onClick={() => editor.chain().focus().setHorizontalRule().run()} />
        <Tool label={uploading ? 'Laster opp bilde …' : 'Sett inn bilde'} icon={ImagePlus} disabled={uploading} onClick={() => fileRef.current?.click()} />
        <span className="mx-1 w-px self-stretch bg-line" />
        <Tool label="Angre" icon={Undo2} disabled={!active.undo} onClick={() => editor.chain().focus().undo().run()} />
        <Tool label="Gjør om" icon={Redo2} disabled={!active.redo} onClick={() => editor.chain().focus().redo().run()} />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={event => {
            const file = event.target.files?.[0]
            event.target.value = ''
            if (file) void addPicture(file)
          }}
        />
      </div>
      {error && <p className="border-b border-line bg-[#fbe9e7] px-4 py-2 font-ui text-[14px] text-[#b3261e]">{error}</p>}
      <EditorContent editor={editor} className="editor-body" />
    </div>
  )
}
