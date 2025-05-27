export const sortByTitle = (tasks, direction ) => {
    return [...tasks].sort((a, b) => {
        return direction === 'A..Z'
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
    });
};

export const sortByDate = (tasks, dateField, direction) => {
    return [...tasks].sort((a, b) => {
        return direction === 'asc'
            ? a[dateField].localeCompare(b[dateField])
            : b[dateField].localeCompare(a[dateField]);
    });
};