// boardUtils.js
export const filterByCategoryArray = (category, originalColumns, setColumns, setFiltredTask) => {
    const newFilter = { category };
    if (category === 'all') {
        setColumns(originalColumns);
        setFiltredTask(originalColumns);
        return newFilter;
    }

    const filteredColumns = {
        planned: {
            ...originalColumns.planned,
            cards: originalColumns.planned.cards.filter(task => task.category === category)
        },
        inProgress: {
            ...originalColumns.inProgress,
            cards: originalColumns.inProgress.cards.filter(task => task.category === category)
        },
        Done: {
            ...originalColumns.Done,
            cards: originalColumns.Done.cards.filter(task => task.category === category)
        }
    };
    setColumns(filteredColumns);
    setFiltredTask(filteredColumns);
    return newFilter;
};

export const handleFilterByOwnerAndCategory = (category, owner, originalColumns, setColumns, setCurrentFilter) => {
    const newFilters = {
        category: category !== null ? category : 'all',
        owner: owner !== null ? owner : 'all'
    };

    let filteredData = {...originalColumns};

    if (newFilters.category !== 'all') {
        filteredData = {
            planned: {
                ...filteredData.planned,
                cards: filteredData.planned.cards.filter(task => task.category === newFilters.category)
            },
            inProgress: {
                ...filteredData.inProgress,
                cards: filteredData.inProgress.cards.filter(task => task.category === newFilters.category)
            },
            Done: {
                ...filteredData.Done,
                cards: filteredData.Done.cards.filter(task => task.category === newFilters.category)
            }
        };
    }

    if (newFilters.owner !== 'all') {
        filteredData = {
            planned: {
                ...filteredData.planned,
                cards: filteredData.planned.cards.filter(task => task.owner === newFilters.owner)
            },
            inProgress: {
                ...filteredData.inProgress,
                cards: filteredData.inProgress.cards.filter(task => task.owner === newFilters.owner)
            },
            Done: {
                ...filteredData.Done,
                cards: filteredData.Done.cards.filter(task => task.owner === newFilters.owner)
            }
        };
    }

    setColumns(filteredData);
    setCurrentFilter(newFilters);
    return newFilters;
};