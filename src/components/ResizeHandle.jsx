import { useEffect, useRef } from 'react'

// The sidebar is anchored to the right edge of the window, so its width is
// just the distance from the drag position to that edge — no need to track
// the starting width/position, unlike a typical drag-delta resize.
function ResizeHandle({ onResize }) {
  const draggingRef = useRef(false)

  const handleMouseDown = (event) => {
    event.preventDefault()
    draggingRef.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!draggingRef.current) return
      onResize(window.innerWidth - event.clientX)
    }
    const stopDragging = () => {
      if (!draggingRef.current) return
      draggingRef.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', stopDragging)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', stopDragging)
    }
  }, [onResize])

  return (
    <div
      className="sidebar-resize-handle"
      onMouseDown={handleMouseDown}
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize sidebar"
    />
  )
}

export default ResizeHandle
