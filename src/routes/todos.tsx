import { createFileRoute } from '@tanstack/solid-router'
import { createSignal, createEffect, createMemo, For } from 'solid-js'

type Todo = { id: string; text: string; completed: boolean }

export const Route = createFileRoute('/todos')({ component: TodosPage })

function TodosPage() {
  const [todos, setTodos] = createSignal<Todo[]>(() => {
    try {
      const raw = localStorage.getItem('todos_v1')
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  createEffect(() => {
    try {
      localStorage.setItem('todos_v1', JSON.stringify(todos()))
    } catch {
      // ignore
    }
  })

  const [text, setText] = createSignal('')
  const [filter, setFilter] = createSignal<'all' | 'active' | 'completed'>('all')
  const [editingId, setEditingId] = createSignal<string | null>(null)
  const [editText, setEditText] = createSignal('')

  const filtered = createMemo(() => {
    const f = filter()
    return todos().filter((t) => (f === 'all' ? true : f === 'active' ? !t.completed : t.completed))
  })

  function addTodo(e?: Event) {
    e?.preventDefault()
    const t = text().trim()
    if (!t) return
    const next: Todo = { id: Date.now().toString() + Math.random().toString(36).slice(2), text: t, completed: false }
    setTodos([...todos(), next])
    setText('')
  }

  function toggle(id: string) {
    setTodos(todos().map((td) => (td.id === id ? { ...td, completed: !td.completed } : td)))
  }

  function remove(id: string) {
    setTodos(todos().filter((td) => td.id !== id))
  }

  function startEdit(todo: Todo) {
    setEditingId(todo.id)
    setEditText(todo.text)
  }

  function saveEdit(id: string) {
    const t = editText().trim()
    if (!t) return
    setTodos(todos().map((td) => (td.id === id ? { ...td, text: t } : td)))
    setEditingId(null)
    setEditText('')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditText('')
  }

  return (
    <main class="page-wrap px-4 pb-8 pt-14">
      <section class="island-shell rise-in relative overflow-hidden rounded-[1rem] px-6 py-8 sm:px-10 sm:py-10">
        <h1 class="display-title mb-4 text-2xl font-bold">Todos</h1>

        <form onSubmit={addTodo} class="mb-4 flex gap-2">
          <input
            class="rounded-md border px-3 py-2 flex-1"
            value={text()}
            onInput={(e: any) => setText(e.currentTarget.value)}
            placeholder="Add a new todo"
            aria-label="New todo"
          />
          <button class="rounded-md bg-[var(--lagoon-deep)] px-4 py-2 text-white" type="submit">
            Add
          </button>
        </form>

        <div class="mb-4 flex gap-2">
          <button class="rounded-md px-3 py-1 border" onClick={() => setFilter('all')}>All</button>
          <button class="rounded-md px-3 py-1 border" onClick={() => setFilter('active')}>Active</button>
          <button class="rounded-md px-3 py-1 border" onClick={() => setFilter('completed')}>Completed</button>
        </div>
        <ul class="m-0 space-y-2 list-none p-0">
          <For each={filtered()} fallback={<li class="text-sm text-[var(--sea-ink-soft)]">No todos yet</li>}>
            {(todo: Todo) => (
              <li class="flex items-center justify-between rounded-md border p-3">
                <div class="flex items-center gap-3">
                  <input type="checkbox" checked={todo.completed} onChange={() => toggle(todo.id)} />
                  {editingId() === todo.id ? (
                    <input
                      class="rounded-md border px-2 py-1"
                      value={editText()}
                      onInput={(e: any) => setEditText(e.currentTarget.value)}
                      onKeyDown={(e: KeyboardEvent) => {
                        if (e.key === 'Enter') saveEdit(todo.id)
                        if (e.key === 'Escape') cancelEdit()
                      }}
                      autofocus
                    />
                  ) : (
                    <span class={todo.completed ? 'line-through text-[var(--sea-ink-soft)]' : ''}>{todo.text}</span>
                  )}
                </div>

                <div class="flex items-center gap-2">
                  {editingId() === todo.id ? (
                    <>
                      <button class="text-sm px-2" onClick={() => saveEdit(todo.id)}>Save</button>
                      <button class="text-sm px-2" onClick={cancelEdit}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button class="text-sm px-2" onClick={() => startEdit(todo)}>Edit</button>
                      <button class="text-sm text-red-500" onClick={() => remove(todo.id)} aria-label="Delete todo">Delete</button>
                    </>
                  )}
                </div>
              </li>
            )}
          </For>
        </ul>
      </section>
    </main>
  )
}
