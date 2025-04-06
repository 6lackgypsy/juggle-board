import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Id, Task } from "../types"
import DeleteIcon from "../icons/DeleteIcon"
import { useState } from "react"

type TaskCardProps = {
  task: Task
  deleteTask: (id: Id) => void
  updateTask: (id: Id, content: string) => void
}

const TaskCard = ({ task, deleteTask, updateTask }: TaskCardProps) => {
  const [mouseIsOver, setMouseIsOver] = useState(false)
  const [editMode, setEditMode] = useState(false)

  const toggleEditMode = () => {
    setEditMode((prev) => !prev)
    setMouseIsOver(false)
  }
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task
    },
    disabled: editMode
  })

  const style = {
    transition,
    transform: CSS.Transform.toString(transform)
  }

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-mainBgColor p-2.5 h-[100px] min-h-[100px] flex items-center text-left rounded-xl cursor-grab relative opacity-30 border-2 border-rose-500"
      />
    )
  }

  return editMode ? (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-mainBgColor p-2.5 h-[100px] min-h-[100px] flex items-center text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-rose-500 cursor-grab relative"
    >
      <textarea
        autoFocus
        placeholder="Task content here"
        className="h-[90%] w-full resize-none border-none rounded bg-transparent text-white focus:outline-none"
        value={task.content}
        onChange={(e) => updateTask(task.id, e.target.value)}
        onBlur={toggleEditMode}
        onKeyDown={(e) => {
          if (e.key !== "Enter" || e.shiftKey) {
            return
          }

          setEditMode(false)
        }}
      ></textarea>
    </div>
  ) : (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-mainBgColor p-2.5 h-[100px] min-h-[100px] flex items-center text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-rose-500 cursor-grab relative"
      onMouseEnter={() => setMouseIsOver(true)}
      onMouseLeave={() => setMouseIsOver(false)}
      onClick={toggleEditMode}
    >
      <p className="my-auto h-[90%] w-full overflow-y-auto overflow-x-hidden whitespace-pre-wrap task">
        {task.content}
      </p>
      {mouseIsOver && (
        <button
          className="stroke-white absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded opacity-60 hover:opacity-100"
          onClick={() => deleteTask(task.id)}
        >
          <DeleteIcon />
        </button>
      )}
    </div>
  )
}

export default TaskCard
