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
    // Initiera AOS-animationer
    useEffect(() => {
        AOS.init({
            duration: 2000,
            easing: "ease-out-cubic",
            once: true // Animationer spelas bara en gång
        });
    }, []);

    // Tillstånd för kolumner och filter
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

    // Tillstånd för modala fönster
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showOwnerModal, setShowOwnerModal] = useState(false);
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [showAddOwnerModal, setShowAddOwnerModal] = useState(false);

    // Tillstånd för formulär
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

    // Drag and Drop-tillstånd
    const [draggedCard, setDraggedCard] = useState(null);
    const [draggedColumn, setDraggedColumn] = useState(null);

    // Ladda data
    const loadData = async () => {
        try {
            await Promise.all([
                loadTasksFromFirebase(),
                loadMembersFromFirebase()
            ]);
        } catch (error) {
            console.error("Kunde inte ladda data:", error);
            toast("Kunde inte ladda data. Försök igen senare.");
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
                console.log("Ingen medlemsdata tillgänglig");
            }
        } catch (error) {
            console.error("Fel vid laddning av medlemmar:", error);
            toast("Kunde inte ladda teammedlemmar.");
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
            console.error("Fel vid laddning av uppgifter:", error);
            toast("Kunde inte ladda uppgifter.");
        }
    };

    // Filterhanterare
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
            console.error("Filterfel:", error);
            toast.error("Kunde inte applicera filter.");
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
            console.error("Filterfel:", error);
            toast.error("Kunde inte applicera filter.");
        }
    };

    const handleFilterByOwnerAndCategory = (category = null, owner = null) => {
        try {
            // Uppdatera aktiva filter
            const newFilters = {
                category: category !== null ? category : activeFilters.category,
                owner: owner !== null ? owner : activeFilters.owner
            };
            setActiveFilters(newFilters);

            // Applicera båda filtren sekventiellt
            let filteredData = {...originalColumns};

            // Först filtrera efter kategori om angiven
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

            // Sedan filtrera efter ägare om angiven
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

            // Om båda filter är 'all' eller null, återställ till original
            if (
                (newFilters.category === 'all' || newFilters.category === null) &&
                (newFilters.owner === 'all' || newFilters.owner === null)
            ) {
                filteredData = originalColumns;
            }

            setColumns(filteredData);
            setCurrentFilter(newFilters);

            // Uppdatera localStorage om nödvändigt
            if (category !== null) localStorage.setItem('category', category);
            if (owner !== null) localStorage.setItem('owner', owner);
        } catch (error) {
            console.error("Komplext filterfel:", error);
            toast.error("Kunde inte applicera komplext filter.");
        }
    };

    // Drag and Drop-hanterare
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
                // Hitta rätt uppgift (t.ex. via ID)
                const taskId = draggedCard; // Ersätt med verkligt uppgifts-ID
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
                    // Uppdatera uppgiften
                    await update(ref(db, `tasks/${taskId}`), {
                        status: status
                    });

                    console.log("Uppgift uppdaterad");
                }

            }


            const newColumns = {...columns};
            const card = newColumns[draggedColumn].cards.find(c => c.id === draggedCard);

            newColumns[draggedColumn].cards = newColumns[draggedColumn].cards.filter(c => c.id !== draggedCard);
            newColumns[targetColumnId].cards.push(card);

            setColumns(newColumns);
            // Här kan du lägga till sparande till Firebase
        }

        setDraggedCard(null);
        setDraggedColumn(null);
        await loadTasksFromFirebase();
    };

    // Hanterare för modala fönster
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

    // Formulärhanterare
    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setNewTask(prev => ({...prev, [name]: value}));
    };

    const handleInputChangeName = (e) => {
        const {name, value} = e.target;
        setNewMember(prev => ({...prev, [name]: value}));
    };

    // CRUD-operationer
    const handleAddTask = async () => {
        try {
            if (!newTask.title || !newTask.title.trim()) {
                toast.warning("Ange en uppgiftstitel");
                return;
            }
            if (!newTask.description || !newTask.description.trim()) {
                toast.warning("Ange en beskrivning");
                return;
            }


            if (newTask.id) {
                // Redigeringsläge
                const db = getDatabase(database.app);
                await update(ref(db, `tasks/${newTask.id}`), {
                    title: newTask.title,
                    description: newTask.description,
                    dueDate: newTask.dueDate,
                    category: newTask.category,
                    owner: newTask.owner,
                    priority: newTask.priority
                });
                toast.success("Uppgift uppdaterad");
            } else {
                // Skapandeläge
                await saveTask(newTask);
                toast.success("Uppgift skapad");
            }

            await loadTasksFromFirebase();
            handleHideTaskModal();
        } catch (error) {
            console.error("Fel vid sparande av uppgift:", error);
            toast.error("Kunde inte spara uppgift.");
        }
    };

    const handleAddMember = async () => {
        try {
            if (!newMember.name.trim()) {
                toast.warning("Ange medlemsnamn");
                return;
            }

            const db = getDatabase(database.app);
            const newDocRef = push(ref(db, "members"));
            await set(newDocRef, {
                name: newMember.name.trim(),
                category: newMember.category,
            });

            toast.success("Teammedlem tillagd");
            await loadMembersFromFirebase();
            handleHideMemberModal();
            setNewMember({ name: '', category: '' });
        } catch (error) {
            console.error("Fel vid sparande av medlem:", error);
            toast.error("Kunde inte lägga till teammedlem.");
        }
    };

    const handleAddOwner = async () => {
        try {
            if (!ownerUpdate) {
                toast.warning("Välj en ägare");
                return;
            }

            const db = getDatabase(database.app);
            await update(ref(db, `tasks/${draggedCard}`), {
                owner: ownerUpdate,
                status: 'in process'
            });

            toast.success("Ägare tilldelad");
            await loadTasksFromFirebase();
            handleHideAddOwnerModal();
        } catch (error) {
            console.error("Fel vid uppdatering av ägare:", error);
            toast.error("Kunde inte tilldela ägare.");
        }
    };

    // Sortering
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
            console.error("Sorteringsfel:", error);
            toast.error("Kunde inte sortera uppgifter.");
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
            console.error("Sorteringsfel:", error);
            toast.error("Kunde inte sortera uppgifter efter förfallodatum.");
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
            console.error("Sorteringsfel:", error);
            toast.error("Kunde inte sortera uppgifter efter skapelsedatum.");
        }
    }

    async function handleEdit(cardId) {
        try {
            const db = getDatabase(database.app);
            const taskRef = ref(db, `tasks/${cardId}`);
            const snapshot = await get(taskRef);

            if (!snapshot.exists()) {
                throw new Error("Uppgift hittades inte");
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
            console.error("Redigeringsfel:", error);
            toast.error("Kunde inte ladda uppgift för redigering.");
        }
    }

    async function handleDelete(cardId) {
        try {
            if (!window.confirm("Är du säker på att du vill ta bort denna uppgift?")) {
                return;
            }

            const db = getDatabase(database.app);
            await update(ref(db, `tasks/${cardId}`), {
                status: 'deleted'
            });

            toast.success("Uppgift borttagen");
            await loadTasksFromFirebase();
        } catch (error) {
            console.error("Borttagningsfel:", error);
            toast.error("Kunde inte ta bort uppgift.");
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
            {/* Modala fönster */}
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

            {/* Board header */}
            <BoardHeader
                setShowTaskModal={handleShowTaskModal}
                setShowMemberModal={handleShowMemberModal}
                handleShow={() => setShowFilterCanvas(true)}
                handleSortByTitle={handleSortByTitle}
                handleSortByDate={handleSortByDate}
                handleSortByExDate={handleSortByExDate}
            />

            {/* Uppgiftskolumner */}
            <BoardColumns
                handleDragOver={handleDragOver}
                handleDrop={handleDrop}
                handleShow={() => setShowFilterCanvas(true)}
                handleDragStart={handleDragStart}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                columns={columns}
            />

            {/* Filter sidopanel */}
            <Offcanvas show={showFilterCanvas} onHide={() => setShowFilterCanvas(false)} placement="end">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Filtrera Uppgifter</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Dropdown className="mx-2 my-3">
                        <Dropdown.Toggle variant="light" id="dropdown-filter-category">
                            <i className="fas fa-filter"></i> Filtrera efter Kategori
                            <span className="badge bg-info ms-2">
                                {currentFilter.category || 'Alla'}
                            </span>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => handleFilterByCategory('all')}>Alla</Dropdown.Item>
                            <Dropdown.Item onClick={() => handleFilterByCategory('ux')}>UX</Dropdown.Item>
                            <Dropdown.Item onClick={() => handleFilterByCategory('frontend')}>Frontend</Dropdown.Item>
                            <Dropdown.Item onClick={() => handleFilterByCategory('backend')}>Backend</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>

                    <Dropdown className="mx-2 my-5">
                        <Dropdown.Toggle variant="light" id="dropdown-filter-owner">
                            <i className="fas fa-user-tag"></i> Filtrera efter Ägare
                            <span className="badge bg-info ms-2">
                                {currentFilter.owner || 'Alla'}
                            </span>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => handleFilterByOwner('all')}>Alla</Dropdown.Item>
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
                            <i className="fas fa-filter"></i> Kombinerat Filter
                            <span className="badge bg-info ms-2">
                                <div>Kategori: {currentFilter.category || 'Alla'}</div>
                                <div>Ägare: {currentFilter.owner || 'Alla'}</div>
                            </span>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Header>Kategori</Dropdown.Header>
                            <Dropdown.Item onClick={() => handleFilterByOwnerAndCategory('all', null)}>
                                Alla Kategorier
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

                            <Dropdown.Header>Ägare</Dropdown.Header>
                            <Dropdown.Item onClick={() => handleFilterByOwnerAndCategory(null, 'all')}>
                                Alla Ägare
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