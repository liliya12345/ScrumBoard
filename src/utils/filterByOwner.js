
export const filterByOwner = (owner,originalColumns,setColumns, setFiltredTask,  ) => {
    const newFilter = { owner };
    if (owner === 'all') {
        setColumns(originalColumns);
        return newFilter;
    }
    const filteredColumns = {
        planned: {
            ...originalColumns.planned,
            cards: originalColumns.planned.cards.filter(task => task.owner === owner)
        },
        inProgress: {
            ...originalColumns.inProgress,
            cards: originalColumns.inProgress.cards.filter(task => task.owner === owner)
        },
        Done: {
            ...originalColumns.Done,
            cards: originalColumns.Done.cards.filter(task => task.owner === owner)
        }
    };
    setColumns(filteredColumns);
    setFiltredTask(filteredColumns)
    console.log(filteredColumns)
    return newFilter;



}