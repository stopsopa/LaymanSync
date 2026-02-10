Let's work on @RowCRUDComponent.tsx 

I would like to to create four rows in this component:

FIRST ROW: will represent source from MainOptionalTypes type, it will be handled with component electron/src/renderer/components/DropzoneDirectory.tsx and on the right from it there should be button "reveal in finder" which is active (clickable) when source is not null

SECOND ROW: will represent destination from MainOptionalTypes type, it will be handled with component electron/src/renderer/components/DropzoneDirectory.tsx and on the right from it there should be button "reveal in finder" which is active (clickable) when destination is not null

THIRD ROW: will represent delete flag from MainOptionalTypes type, it should be represented with checkbox (by default false/unticked) and if it will be manually ticked it should be highlighted with red color and once user hover over it we will render warning what this flag does.

for warning user html native Popover API https://developer.mozilla.org/en-US/docs/Web/API/Popover_API

last row will be called PROGRESS BAR ROW on the left takin most of the space, then on the right in the same row we will have some reserved space for delete button

delete button once pressed shoulnd't immediately remove object from the list but render modal to ask if whe should do that. In modal we should see what we are about to remove. so present source, target and delete flag