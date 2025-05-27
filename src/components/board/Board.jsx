import React, {useEffect, useState} from 'react';
import '../../App.css';
import {Dropdown, Offcanvas} from "react-bootstrap";
import {getDatabase, ref, get, set, update, push} from "firebase/database";
import database from "../../firebase";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Tasks from "../modals/Tasks";
import MembersModal from "../modals/MembersModal";
import OwnerModal from "../modals/OwnerModal";
import AOS from "aos";
import "aos/dist/aos.css";
import {sortByTitle, sortByDate} from "../ui/sorts";
import {loadTasks, saveTask} from "../../api/firebase";
import BoardHeader from "./BoardHeader";
import BoardColumns from "./BoardColumns";
import {filterByCategoryArray, handleFilterByOwnerAndCategory} from '../../utils/filterByCategoryArray'
import {filterByOwner} from "../../utils/filterByOwner";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
function Board(props) {
    // Инициализация AOS анимаций
    useEffect(() => {
        AOS.init({
            duration: 2000,
            easing: "ease-out-cubic",
            once: true // Анимации проигрываются только один раз
        });
    }, []);

    // Состояния для колонок и фильтров
    const [originalColumns, setOriginalColumns] = useState({
        planned: {title: 'New', cards: []},
        inProgress: {title: 'In process', cards: []},
        Done: {title: <span title="Done 🎉">Done 🎉</span>, cards: []}
    });

    const [columns, setColumns] = useState({...originalColumns});
    const [showFilterCanvas, setShowFilterCanvas] = useState(false);
    const [currentFilter, setCurrentFilter] = useState({
        category: '',
        owner: ''
    });
    const [activeFilters, setActiveFilters] = useState({
        category: null,
        owner: null
    });
    const [members, setMembers] = useState([]);
    const [originalMembers, setOriginalMembers] = useState([]);
    let [ownerUpdate, setOwnerUpdate] = useState(null);
    const [filtredTask, setFiltredTask] = useState({...originalColumns});

    // Состояния модальных окон
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showOwnerModal, setShowOwnerModal] = useState(false);
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [showAddOwnerModal, setShowAddOwnerModal] = useState(false);

    // Состояния для форм
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        dueDate: '',
        createDate: '',
        category: 'frontend',
        status: '',
        owner: 'Unassigned',
        priority: 'low'
    });

    const [newMember, setNewMember] = useState({
        name: '',
        category: ''
    });

    // Drag and Drop состояние
    const [draggedCard, setDraggedCard] = useState(null);
    const [draggedColumn, setDraggedColumn] = useState(null);

    // Загрузка данных
    const loadData = async () => {
        try {
            await Promise.all([
                loadTasksFromFirebase(),
                loadMembersFromFirebase()
            ]);
        } catch (error) {
            console.error("Failed to load data:", error);

            toast("Failed to load data. Please try again later.");
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const loadMembersFromFirebase = async () => {
        try {
            const db = getDatabase(database.app);
            const dbRef = ref(db, "members");
            const snapshot = await get(dbRef);

            if (snapshot.exists()) {
                const membersData = snapshot.val();
                const membersArray = Object.keys(membersData).map(key => ({
                    id: key,
                    ...membersData[key]
                }));

                setOriginalMembers(membersArray);
                setMembers(membersArray);
            } else {
                console.log("No members data available");
            }
        } catch (error) {
            console.error("Error loading members:", error);
            toast("Failed to load team members.");
        }
    };

    const loadTasksFromFirebase = async () => {
        try {
            const tasksArray = await loadTasks();
            const updatedColumns = {
                planned: {
                    title: 'New',
                    cards: tasksArray.filter(task => !task.status || task.status === 'new')
                },
                inProgress: {
                    title: 'In process',
                    cards: tasksArray.filter(task => task.status === 'in process')
                },
                Done: {
                    title: <span title="Done 🎉">Done 🎉</span>,
                    cards: tasksArray.filter(task => task.status === 'done')
                }
            };
            setOriginalColumns(updatedColumns);
            setColumns(updatedColumns);
        } catch (error) {
            console.error("Error loading tasks:", error);
            toast("Failed to load tasks.");
        }
    };

    // Обработчики фильтрации
    const handleFilterByCategory = (category) => {
        try {
            const newFilter = filterByCategoryArray(
                category,
                originalColumns,
                setColumns,
                setFiltredTask
            );
            setCurrentFilter(prev => ({...prev, ...newFilter}));
            localStorage.setItem('category', category);
        } catch (error) {
            console.error("Filter error:", error);
            toast.error("Failed to apply filter.");
        }
    };

    const handleFilterByOwner = (owner) => {
        try {
            const newFilter = filterByOwner(
                owner,
                originalColumns,
                setColumns,
                setFiltredTask
            );
            setCurrentFilter(prev => ({...prev, ...newFilter}));
            localStorage.setItem('owner', owner);
        } catch (error) {
            console.error("Filter error:", error);
            toast.error("Failed to apply filter.");
        }
    };

    const handleFilterByOwnerAndCategory = (category = null, owner = null) => {
        try {
            // Update active filters state
            const newFilters = {
                category: category !== null ? category : activeFilters.category,
                owner: owner !== null ? owner : activeFilters.owner
            };
            setActiveFilters(newFilters);

            // Apply both filters sequentially
            let filteredData = {...originalColumns};

            // First filter by category if specified
            if (newFilters.category && newFilters.category !== 'all') {
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

            // Then filter by owner if specified
            if (newFilters.owner && newFilters.owner !== 'all') {
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

            // If both filters are 'all' or null, reset to original
            if (
                (newFilters.category === 'all' || newFilters.category === null) &&
                (newFilters.owner === 'all' || newFilters.owner === null)
            ) {
                filteredData = originalColumns;
            }

            setColumns(filteredData);
            setCurrentFilter(newFilters);

            // Update localStorage if needed
            if (category !== null) localStorage.setItem('category', category);
            if (owner !== null) localStorage.setItem('owner', owner);
        } catch (error) {
            console.error("Complex filter error:", error);
            toast.error("Failed to apply complex filter.");
        }
    };

    // Drag and Drop обработчики
    const handleDragStart = (cardId, columnId) => {
        setDraggedCard(cardId);
        setDraggedColumn(columnId);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = async (targetColumnId) => {
        if (draggedCard && draggedColumn !== targetColumnId) {
            console.log(draggedCard)
            console.log(targetColumnId)
            let status = draggedColumn
            if (targetColumnId == 'inProgress') status = 'in process'
            if (targetColumnId == 'planned') status = 'new'
            if (targetColumnId == 'Done') status = 'done'

            const db = getDatabase(database.app);
            const tasksRef = ref(db, "tasks");
            const snapshot = await get(tasksRef);

            if (snapshot.exists()) {
                const tasksData = snapshot.val();
                // Находим нужную задачу (например, по ID)
                const taskId = draggedCard; // Замените на реальный ID задачи
                const taskToUpdate = tasksData[taskId];
                ownerUpdate = {...taskToUpdate}
                console.log(taskToUpdate);

                if (taskToUpdate) {
                    if (targetColumnId === 'inProgress' && taskToUpdate.owner === 'Unassigned') {
                        setShowAddOwnerModal(true);
                        return;
                    } else if (targetColumnId === 'Done' && taskToUpdate.owner === 'Unassigned') {
                        setShowAddOwnerModal(true);
                        return;
                    } else if (targetColumnId === 'planned') {
                        await update(ref(db, `tasks/${taskId}`), {
                            owner: 'Unassigned'
                        });

                    }
                    // Обновляем задачу
                    await update(ref(db, `tasks/${taskId}`), {
                        status: status
                    });

                    console.log("Task updated successfully");
                }

            }


            const newColumns = {...columns};
            const card = newColumns[draggedColumn].cards.find(c => c.id === draggedCard);

            newColumns[draggedColumn].cards = newColumns[draggedColumn].cards.filter(c => c.id !== draggedCard);
            newColumns[targetColumnId].cards.push(card);

            setColumns(newColumns);
            // Здесь можно добавить сохранение в Firebase
        }

        setDraggedCard(null);
        setDraggedColumn(null);
        await loadTasksFromFirebase();
    };

    // Обработчики модальных окон
    const handleHideTaskModal = () => {
        setNewTask({
            title: '',
            description: '',
            dueDate: '',
            createDate: '',
            category: 'frontend',
            status: '',
            owner: 'Unassigned',
            priority: 'low'
        });
        setShowTaskModal(false);
    };

    const handleShowTaskModal = () => setShowTaskModal(true);
    const handleHideOwnerModal = () => setShowOwnerModal(false);
    const handleShowMemberModal = () => setShowMemberModal(true);
    const handleHideMemberModal = () => setShowMemberModal(false);
    const handleHideAddOwnerModal = () => setShowAddOwnerModal(false);

    // Обработчики форм
    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setNewTask(prev => ({...prev, [name]: value}));
    };

    const handleInputChangeName = (e) => {
        const {name, value} = e.target;
        setNewMember(prev => ({...prev, [name]: value}));
    };

    // CRUD операции
    const handleAddTask = async () => {
        try {
            if (!newTask.title || !newTask.title.trim()) {
                toast.warning("Please enter a task title");
                return;
            }
            if (!newTask.description || !newTask.description.trim()) {
                toast.warning("Please enter a description");
                return;
            }


            if (newTask.id) {
                // Режим редактирования
                const db = getDatabase(database.app);
                await update(ref(db, `tasks/${newTask.id}`), {
                    title: newTask.title,
                    description: newTask.description,
                    dueDate: newTask.dueDate,
                    category: newTask.category,
                    owner: newTask.owner,
                    priority: newTask.priority
                });
                toast.success("Task updated successfully");
            } else {
                // Режим создания
                await saveTask(newTask);
                toast.success("Task created successfully");
            }

            await loadTasksFromFirebase();
            handleHideTaskModal();
        } catch (error) {
            console.error("Task save error:", error);
            toast.error("Failed to save task.");
        }
    };

    const handleAddMember = async () => {
        try {
            if (!newMember.name.trim()) {
                toast.warning("Please enter member name");
                return;
            }

            const db = getDatabase(database.app);
            const newDocRef = push(ref(db, "members"));
            await set(newDocRef, {
                name: newMember.name.trim(),
                category: newMember.category,
            });

            toast.success("Team member added successfully");
            await loadMembersFromFirebase();
            handleHideMemberModal();
            setNewMember({ name: '', category: '' });
        } catch (error) {
            console.error("Member save error:", error);
            toast.error("Failed to add team member.");
        }
    };

    const handleAddOwner = async () => {
        try {
            if (!ownerUpdate) {
                toast.warning("Please select an owner");
                return;
            }

            const db = getDatabase(database.app);
            await update(ref(db, `tasks/${draggedCard}`), {
                owner: ownerUpdate,
                status: 'in process'
            });

            toast.success("Owner assigned successfully");
            await loadTasksFromFirebase();
            handleHideAddOwnerModal();
        } catch (error) {
            console.error("Owner update error:", error);
            toast.error("Failed to assign owner.");
        }
    };

    // Сортировка
    function handleSortByTitle(sortDirection) {
        try {
            const hasActiveFilters = currentFilter.category !== 'all' ||
                currentFilter.owner !== 'all';

            const sourceColumns = hasActiveFilters ? columns : originalColumns;

            const newColumns = {
                planned: {
                    ...sourceColumns.planned,
                    cards: sortByTitle([...sourceColumns.planned.cards], sortDirection)
                },
                inProgress: {
                    ...sourceColumns.inProgress,
                    cards: sortByTitle([...sourceColumns.inProgress.cards], sortDirection)
                },
                Done: {
                    ...sourceColumns.Done,
                    cards: sortByTitle([...sourceColumns.Done.cards], sortDirection)
                }
            };

            setColumns(newColumns);
            if (hasActiveFilters) {
                setFiltredTask(newColumns);
            }
        } catch (error) {
            console.error("Sort error:", error);
            toast.error("Failed to sort tasks.");
        }
    }

    function handleSortByExDate(sortDirection) {
        try {
            const hasActiveFilters = currentFilter.category !== 'all' ||
                currentFilter.owner !== 'all';

            const sourceColumns = hasActiveFilters ? columns : originalColumns;
            const dateField = 'dueDate';

            const newColumns = {
                planned: {
                    ...sourceColumns.planned,
                    cards: sortByDate([...sourceColumns.planned.cards], dateField, sortDirection)
                },
                inProgress: {
                    ...sourceColumns.inProgress,
                    cards: sortByDate([...sourceColumns.inProgress.cards], dateField, sortDirection)
                },
                Done: {
                    ...sourceColumns.Done,
                    cards: sortByDate([...sourceColumns.Done.cards], dateField, sortDirection)
                }
            };

            setColumns(newColumns);
            if (hasActiveFilters) {
                setFiltredTask(newColumns);
            }
        } catch (error) {
            console.error("Sort error:", error);
            toast.error("Failed to sort tasks by due date.");
        }
    }

    function handleSortByDate(sortDirection) {
        try {
            const hasActiveFilters = currentFilter.category !== 'all' ||
                currentFilter.owner !== 'all';

            const sourceColumns = hasActiveFilters ? columns : originalColumns;
            const dateField = 'createDate';

            const newColumns = {
                planned: {
                    ...sourceColumns.planned,
                    cards: sortByDate([...sourceColumns.planned.cards], dateField, sortDirection)
                },
                inProgress: {
                    ...sourceColumns.inProgress,
                    cards: sortByDate([...sourceColumns.inProgress.cards], dateField, sortDirection)
                },
                Done: {
                    ...sourceColumns.Done,
                    cards: sortByDate([...sourceColumns.Done.cards], dateField, sortDirection)
                }
            };

            setColumns(newColumns);
            if (hasActiveFilters) {
                setFiltredTask(newColumns);
            }
        } catch (error) {
            console.error("Sort error:", error);
            toast.error("Failed to sort tasks by creation date.");
        }
    }

    async function handleEdit(cardId) {
        try {
            const db = getDatabase(database.app);
            const taskRef = ref(db, `tasks/${cardId}`);
            const snapshot = await get(taskRef);

            if (!snapshot.exists()) {
                throw new Error("Task not found");
            }

            const taskData = snapshot.val();
            setNewTask({
                id: cardId,
                title: taskData.title || '',
                description: taskData.description || '',
                dueDate: taskData.dueDate || '',
                createDate: taskData.createDate || '',
                category: taskData.category || 'frontend',
                status: taskData.status || '',
                owner: taskData.owner || 'Unassigned',
                priority: taskData.priority || 'low'
            });

            setShowTaskModal(true);
        } catch (error) {
            console.error("Edit error:", error);
            toast.error("Failed to load task for editing.");
        }
    }

    async function handleDelete(cardId) {
        try {
            if (!window.confirm("Are you sure you want to delete this task?")) {
                return;
            }

            const db = getDatabase(database.app);
            await update(ref(db, `tasks/${cardId}`), {
                status: 'deleted'
            });

            toast.success("Task deleted successfully");
            await loadTasksFromFirebase();
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete task.");
        }
    }

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            {/* Модальные окна */}
            <Tasks
                show={showTaskModal}
                handleClose={handleHideTaskModal}
                originalColumns={originalColumns}
                newTask={newTask}
                originalMembers={originalMembers}
                handleInputChange={handleInputChange}
                handleAddTask={handleAddTask}
                isEditing={!!newTask.id}
            />

            <MembersModal
                show={showMemberModal}
                handleClose={handleHideMemberModal}
                newMember={newMember}
                handleInputChangeName={handleInputChangeName}
                handleAddMember={handleAddMember}
            />

            <OwnerModal
                show={showAddOwnerModal}
                handleClose={handleHideAddOwnerModal}
                ownerUpdate={ownerUpdate}
                setOwnerUpdate={setOwnerUpdate}
                members={members}
                handleAddOwner={handleAddOwner}
            />

            {/* Шапка доски */}
            <BoardHeader
                setShowTaskModal={handleShowTaskModal}
                setShowMemberModal={handleShowMemberModal}
                handleShow={() => setShowFilterCanvas(true)}
                handleSortByTitle={handleSortByTitle}
                handleSortByDate={handleSortByDate}
                handleSortByExDate={handleSortByExDate}
            />

            {/* Колонки с задачами */}
            <BoardColumns
                handleDragOver={handleDragOver}
                handleDrop={handleDrop}
                handleShow={() => setShowFilterCanvas(true)}
                handleDragStart={handleDragStart}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                columns={columns}
            />

            {/* Боковая панель фильтров */}
            <Offcanvas show={showFilterCanvas} onHide={() => setShowFilterCanvas(false)} placement="end">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Filter Tasks</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Dropdown className="mx-2 my-3">
                        <Dropdown.Toggle variant="light" id="dropdown-filter-category">
                            <i className="fas fa-filter"></i> Filter by Category
                            <span className="badge bg-info ms-2">
                                {currentFilter.category || 'All'}
                            </span>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => handleFilterByCategory('all')}>All</Dropdown.Item>
                            <Dropdown.Item onClick={() => handleFilterByCategory('ux')}>UX</Dropdown.Item>
                            <Dropdown.Item onClick={() => handleFilterByCategory('frontend')}>Frontend</Dropdown.Item>
                            <Dropdown.Item onClick={() => handleFilterByCategory('backend')}>Backend</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>

                    <Dropdown className="mx-2 my-5">
                        <Dropdown.Toggle variant="light" id="dropdown-filter-owner">
                            <i className="fas fa-user-tag"></i> Filter by Owner
                            <span className="badge bg-info ms-2">
                                {currentFilter.owner || 'All'}
                            </span>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => handleFilterByOwner('all')}>All</Dropdown.Item>
                            {members.map(m => (
                                <Dropdown.Item
                                    key={m.id}
                                    onClick={() => handleFilterByOwner(m.name)}
                                >
                                    {m.name}
                                </Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>

                    <Dropdown className="mx-2 my-3">
                        <Dropdown.Toggle variant="light" id="dropdown-combined-filter">
                            <i className="fas fa-filter"></i> Combined Filter
                            <span className="badge bg-info ms-2">
                                <div>Category: {currentFilter.category || 'All'}</div>
                                <div>Owner: {currentFilter.owner || 'All'}</div>
                            </span>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Header>Category</Dropdown.Header>
                            <Dropdown.Item onClick={() => handleFilterByOwnerAndCategory('all', null)}>
                                All Categories
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleFilterByOwnerAndCategory('ux', null)}>
                                UX
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleFilterByOwnerAndCategory('frontend', null)}>
                                Frontend
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleFilterByOwnerAndCategory('backend', null)}>
                                Backend
                            </Dropdown.Item>

                            <Dropdown.Divider/>

                            <Dropdown.Header>Owner</Dropdown.Header>
                            <Dropdown.Item onClick={() => handleFilterByOwnerAndCategory(null, 'all')}>
                                All Owners
                            </Dropdown.Item>
                            {members.map(m => (
                                <Dropdown.Item
                                    key={m.id}
                                    onClick={() => handleFilterByOwnerAndCategory(null, m.name)}
                                >
                                    {m.name}
                                </Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
}

export default Board;