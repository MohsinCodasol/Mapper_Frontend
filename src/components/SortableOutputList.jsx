import {
  DndContext,
  closestCenter
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableItem({ id }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    marginBottom: "8px",
    background: "#fff",
    cursor: "grab"
  };

  return (
    <div className="text-start" ref={setNodeRef} style={style} {...attributes} {...listeners}>
      ⠿ {id}
    </div>
  );
}

export default function SortableOutputList({ items, onChange }) {
  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={(event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);

        onChange(arrayMove(items, oldIndex, newIndex));
      }}
    >
      <SortableContext
        items={items}
        strategy={verticalListSortingStrategy}
      >
        {items.map(item => (
          <SortableItem key={item} id={item} />
        ))}
      </SortableContext>
    </DndContext>
  );
}
