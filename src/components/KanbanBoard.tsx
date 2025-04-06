import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core"
import { arrayMove, SortableContext } from "@dnd-kit/sortable"
import { Column, Id, Task } from "../types"
import ColumnContainer from "./ColumnContainer"
import AddIcon from "../icons/AddIcon"
import { createPortal } from "react-dom"
import { useMemo, useState } from "react"
import TaskCard from "./TaskCard"

const KanbanBoard = () => {
  const [columns, setColumns] = useState<Column[]>([])
  const [activeColumn, setActveColumn] = useState<Column | null>(null)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])

  const columnIds = useMemo(() => columns.map((column) => column.id), [columns])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5
      }
    })
  )

  const createNewColumn = () => {
    const columnToAdd: Column = {
      id: generateId(),
      title: `Column ${columns.length + 1}`
    }

    setColumns([...columns, columnToAdd])
  }

  const generateId = () => {
    return Math.floor(Math.random() * 10001)
  }

  const deleteColumn = (id: Id) => {
    const filteredColumns = columns.filter((column) => column.id !== id)
    const filteredTasks = tasks.filter((task) => task.columnId !== id)

    setColumns(filteredColumns)
    setTasks(filteredTasks)
  }

  const updateColumn = (id: Id, title: string) => {
    const updatedColumns = columns.map((column) =>
      column.id === id ? { ...column, title } : column
    )

    setColumns(updatedColumns)
  }

  const createTask = (columnId: Id) => {
    const newTask: Task = {
      id: generateId(),
      columnId,
      content: `Task ${tasks.length + 1}`
    }

    setTasks([...tasks, newTask])
  }

  const deleteTask = (id: Id) => {
    const newTasks = tasks.filter((task) => task.id !== id)

    setTasks(newTasks)
  }

  const updateTask = (id: Id, content: string) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, content } : task
    )

    setTasks(updatedTasks)
  }

  const handleDragStart = (e: DragStartEvent) => {
    if (e.active.data.current?.type === "Column") {
      setActveColumn(e.active.data.current.column)
      return
    }

    if (e.active.data.current?.type === "Task") {
      setActiveTask(e.active.data.current.task)
      return
    }
  }

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveTask(null)
    setActveColumn(null)

    const { active, over } = e

    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    setColumns((prev) => {
      const activeColumnIndex = prev.findIndex(
        (column) => column.id === activeId
      )
      const overColumnIndex = prev.findIndex((column) => column.id === overId)

      return arrayMove(columns, activeColumnIndex, overColumnIndex)
    })
  }

  const handleDragOver = (e: DragOverEvent) => {
    const { active, over } = e

    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    const isActiveATask = active.data.current?.type === "Task"
    const isOverATask = over.data.current?.type === "Task"

    if (!isActiveATask) return

    if (isActiveATask && isOverATask) {
      setTasks((prev) => {
        const activeIndex = prev.findIndex((task) => task.id === activeId)
        const overIndex = prev.findIndex((task) => task.id === overId)

        prev[activeIndex].columnId = prev[overIndex].columnId

        return arrayMove(prev, activeIndex, overIndex)
      })
    }

    const isOverAColumn = over.data.current?.type === "Column"

    if (isActiveATask && isOverAColumn) {
      setTasks((prev) => {
        const activeIndex = prev.findIndex((task) => task.id === activeId)

        prev[activeIndex].columnId = overId

        return arrayMove(prev, activeIndex, activeIndex)
      })
    }
  }

  return (
    <div className="m-auto flex min-h-screen items-center overflow-x-auto overflow-y-hidden px-[40px]">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <div className="m-auto flex gap-4">
          <div className="flex gap-4">
            <SortableContext items={columnIds}>
              {columns.map((column) => (
                <ColumnContainer
                  key={column.id}
                  column={column}
                  deleteColumn={deleteColumn}
                  updateColumn={updateColumn}
                  tasks={tasks.filter((task) => task.columnId === column.id)}
                  createTask={createTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                />
              ))}
            </SortableContext>
          </div>
          <button
            className="h-[60px] w-[350px] min-w-[350px] cursor-pointer rounded-lg bg-mainBgColor border-2 border-columnBgColor p-2 ring-rose-500 hover:ring-2 flex gap-3 items-center justify-center"
            onClick={createNewColumn}
          >
            <AddIcon />
            Add Column
          </button>
        </div>
        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <ColumnContainer
                column={activeColumn}
                deleteColumn={deleteColumn}
                updateColumn={updateColumn}
                tasks={tasks.filter(
                  (task) => task.columnId === activeColumn.id
                )}
                createTask={createTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
              />
            )}
            {activeTask && (
              <TaskCard
                task={activeTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
              />
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  )
}

export default KanbanBoard
