import { SortableContext, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import DeleteIcon from "../icons/DeleteIcon"
import { Column, Id, Task } from "../types"
import { useMemo, useState } from "react"
import AddIcon from "../icons/AddIcon"
import TaskCard from "./TaskCard"

type ColumnContainerProps = {
  column: Column
  deleteColumn: (id: Id) => void
  updateColumn: (id: Id, title: string) => void
  tasks: Task[]
  createTask: (columnId: Id) => void
  deleteTask: (id: Id) => void
  updateTask: (id: Id, content: string) => void
}

const ColumnContainer = ({
  column,
  deleteColumn,
  updateColumn,
  tasks,
  createTask,
  deleteTask,
  updateTask
}: ColumnContainerProps) => {
  const [editMode, setEditMode] = useState(false)

  const taskIds = useMemo(() => tasks.map((task) => task.id), [tasks])

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column
    },
    disabled: editMode
  })

  const style = { transition, transform: CSS.Transform.toString(transform) }

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-columnBgColor w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col opacity-40 border-2 border-rose-500"
      />
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-columnBgColor w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col"
    >
      <div
        {...attributes}
        {...listeners}
        className="bg-mainBgColor h-[60px] cursor-grab rounded-md rounded-b-none p-3 font-bold border-4 border-columnBgColor  flex items-center justify-between"
        onClick={() => setEditMode(true)}
      >
        <div className="flex gap-2">
          <div className="flex justify-center items-center bg-columnBgColor px-2 py-1 text-sm rounded-full">
            0
          </div>
          {editMode ? (
            <input
              autoFocus
              value={column.title}
              onChange={(e) => updateColumn(column.id, e.target.value)}
              onBlur={() => setEditMode(false)}
              onKeyDown={(e) => {
                if (e.key !== "Enter") {
                  return
                }

                setEditMode(false)
              }}
              className="bg-black rounded outline-none border focus:border-rose-500 px-2 py-1"
            />
          ) : (
            column.title
          )}
        </div>
        <button
          className="stroke-gray-500 hover:stroke-white hover:bg-columnBgColor rounded transition duration-100 px-1 py-2"
          onClick={() => deleteColumn(column.id)}
        >
          <DeleteIcon />
        </button>
      </div>
      <div className="flex flex-grow flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto ">
        <SortableContext items={taskIds}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              deleteTask={deleteTask}
              updateTask={updateTask}
            />
          ))}
        </SortableContext>
      </div>
      <button
        className="flex gap-4 items-center justify-center border-2 border-columnBgColor rounded-md p-4 border-x-columnBgColor hover:bg-mainBgColor hover:text-rose-500 active:bg-black"
        onClick={() => createTask(column.id)}
      >
        <AddIcon /> Add Task
      </button>
    </div>
  )
}

export default ColumnContainer
