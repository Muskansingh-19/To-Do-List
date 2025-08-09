// Professional To-Do Manager Application

class ProfessionalTodoManager {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.currentSort = 'date';
        this.taskIdCounter = 1;
        this.editingTaskId = null;
        this.deletingTaskId = null;
        this.searchTerm = '';
        
        this.initializeApp();
    }

    initializeApp() {
        this.loadTasks();
        this.updateCurrentDate();
        this.setDefaultDueDate();
        this.bindEvents();
        this.renderTasks();
        this.updateStats();
    }

    loadTasks() {
        // Try to load from localStorage first
        const savedTasks = localStorage.getItem('professionalTodoTasks');
        if (savedTasks) {
            try {
                const parsed = JSON.parse(savedTasks);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    this.tasks = parsed;
                    this.taskIdCounter = Math.max(...this.tasks.map(t => t.id), 0) + 1;
                    return;
                }
            } catch (e) {
                console.error('Error loading saved tasks:', e);
            }
        }
        this.loadSampleData();
    }

    loadSampleData() {
        const sampleTasks = [
            {
                id: 1,
                title: "Prepare Q3 financial presentation",
                priority: "High",
                dueDate: "2025-08-15",
                status: "Pending",
                category: "Work",
                completed: false,
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                title: "Review client proposal documents",
                priority: "Medium",
                dueDate: "2025-08-12",
                status: "In Progress",
                category: "Work",
                completed: false,
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                title: "Schedule team performance reviews",
                priority: "High",
                dueDate: "2025-08-10",
                status: "Pending",
                category: "Meeting",
                completed: false,
                createdAt: new Date().toISOString()
            },
            {
                id: 4,
                title: "Update project documentation",
                priority: "Low",
                dueDate: "2025-08-20",
                status: "Pending",
                category: "Project",
                completed: false,
                createdAt: new Date().toISOString()
            },
            {
                id: 5,
                title: "Conduct market research analysis",
                priority: "Medium",
                dueDate: "2025-08-14",
                status: "Pending",
                category: "Work",
                completed: false,
                createdAt: new Date().toISOString()
            }
        ];

        this.tasks = sampleTasks;
        this.taskIdCounter = 6;
        this.saveTasks();
    }

    saveTasks() {
        try {
            localStorage.setItem('professionalTodoTasks', JSON.stringify(this.tasks));
        } catch (e) {
            console.error('Error saving tasks:', e);
        }
    }

    bindEvents() {
        // Add task button and Enter key
        const addTaskBtn = document.getElementById('add-task-btn');
        const newTaskInput = document.getElementById('new-task-title');
        
        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Add task button clicked');
                this.addTask();
            });
        }
        
        if (newTaskInput) {
            newTaskInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    console.log('Enter key pressed in task input');
                    this.addTask();
                }
            });
        }

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Filter button clicked:', e.target.dataset.filter);
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Sort and search
        const sortSelect = document.getElementById('sort-select');
        const searchInput = document.getElementById('search-input');
        const exportBtn = document.getElementById('export-csv-btn');
        
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                console.log('Sort changed:', e.target.value);
                this.setSort(e.target.value);
            });
        }
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                console.log('Search input:', e.target.value);
                this.searchTasks(e.target.value);
            });
        }

        if (exportBtn) {
            exportBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Export CSV button clicked');
                this.exportToCSV();
            });
        }

        // Modal events
        this.bindModalEvents();

        // Close modals on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeDeleteModal();
                this.closeEditModal();
            }
        });
    }

    bindModalEvents() {
        const cancelDelete = document.getElementById('cancel-delete');
        const confirmDelete = document.getElementById('confirm-delete');
        const cancelEdit = document.getElementById('cancel-edit');
        const saveEdit = document.getElementById('save-edit');
        
        if (cancelDelete) {
            cancelDelete.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeDeleteModal();
            });
        }
        
        if (confirmDelete) {
            confirmDelete.addEventListener('click', (e) => {
                e.preventDefault();
                this.confirmDelete();
            });
        }
        
        if (cancelEdit) {
            cancelEdit.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeEditModal();
            });
        }
        
        if (saveEdit) {
            saveEdit.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveEdit();
            });
        }

        // Close modals on overlay click
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeDeleteModal();
                this.closeEditModal();
            });
        });
    }

    updateCurrentDate() {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const currentDate = new Date().toLocaleDateString('en-US', options);
        const dateElement = document.getElementById('current-date');
        if (dateElement) {
            dateElement.textContent = currentDate;
        }
    }

    setDefaultDueDate() {
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('new-task-date');
        if (dateInput) {
            dateInput.value = today;
        }
    }

    addTask() {
        console.log('addTask method called');
        
        const titleInput = document.getElementById('new-task-title');
        const prioritySelect = document.getElementById('new-task-priority');
        const dateInput = document.getElementById('new-task-date');
        const categorySelect = document.getElementById('new-task-category');

        if (!titleInput || !prioritySelect || !dateInput || !categorySelect) {
            console.error('Required form elements not found');
            return;
        }

        const title = titleInput.value.trim();
        console.log('Task title:', title);
        
        if (!title) {
            alert('Please enter a task description');
            titleInput.focus();
            return;
        }

        const newTask = {
            id: this.taskIdCounter++,
            title: title,
            priority: prioritySelect.value,
            dueDate: dateInput.value,
            status: 'Pending',
            category: categorySelect.value,
            completed: false,
            createdAt: new Date().toISOString()
        };

        console.log('New task created:', newTask);
        this.tasks.unshift(newTask);
        
        // Reset form
        titleInput.value = '';
        prioritySelect.value = 'Medium';
        categorySelect.value = 'Work';
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;

        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        
        // Focus back on input for quick task entry
        titleInput.focus();
    }

    deleteTask(taskId) {
        console.log('Delete task called for ID:', taskId);
        this.deletingTaskId = taskId;
        const deleteModal = document.getElementById('delete-modal');
        if (deleteModal) {
            deleteModal.classList.remove('hidden');
        }
    }

    confirmDelete() {
        console.log('Confirm delete for task ID:', this.deletingTaskId);
        if (this.deletingTaskId) {
            this.tasks = this.tasks.filter(task => task.id !== this.deletingTaskId);
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.closeDeleteModal();
        }
    }

    closeDeleteModal() {
        const deleteModal = document.getElementById('delete-modal');
        if (deleteModal) {
            deleteModal.classList.add('hidden');
        }
        this.deletingTaskId = null;
    }

    editTask(taskId) {
        console.log('Edit task called for ID:', taskId);
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        this.editingTaskId = taskId;
        
        const editElements = {
            title: document.getElementById('edit-task-title'),
            priority: document.getElementById('edit-task-priority'),
            date: document.getElementById('edit-task-date'),
            category: document.getElementById('edit-task-category'),
            status: document.getElementById('edit-task-status')
        };

        if (editElements.title) editElements.title.value = task.title;
        if (editElements.priority) editElements.priority.value = task.priority;
        if (editElements.date) editElements.date.value = task.dueDate;
        if (editElements.category) editElements.category.value = task.category;
        if (editElements.status) editElements.status.value = task.status;

        const editModal = document.getElementById('edit-modal');
        if (editModal) {
            editModal.classList.remove('hidden');
            if (editElements.title) editElements.title.focus();
        }
    }

    saveEdit() {
        if (!this.editingTaskId) return;

        const task = this.tasks.find(t => t.id === this.editingTaskId);
        if (!task) return;

        const editElements = {
            title: document.getElementById('edit-task-title'),
            priority: document.getElementById('edit-task-priority'),
            date: document.getElementById('edit-task-date'),
            category: document.getElementById('edit-task-category'),
            status: document.getElementById('edit-task-status')
        };

        const newTitle = editElements.title ? editElements.title.value.trim() : task.title;
        if (!newTitle) {
            alert('Please enter a task description');
            if (editElements.title) editElements.title.focus();
            return;
        }

        if (editElements.title) task.title = newTitle;
        if (editElements.priority) task.priority = editElements.priority.value;
        if (editElements.date) task.dueDate = editElements.date.value;
        if (editElements.category) task.category = editElements.category.value;
        if (editElements.status) task.status = editElements.status.value;
        
        // Update completed status based on status
        task.completed = task.status === 'Completed';

        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        this.closeEditModal();
    }

    closeEditModal() {
        const editModal = document.getElementById('edit-modal');
        if (editModal) {
            editModal.classList.add('hidden');
        }
        this.editingTaskId = null;
    }

    toggleTaskComplete(taskId) {
        console.log('Toggle task complete called for ID:', taskId);
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        task.completed = !task.completed;
        task.status = task.completed ? 'Completed' : 'Pending';

        console.log('Task toggled:', task);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        this.renderTasks();
    }

    setSort(sortBy) {
        this.currentSort = sortBy;
        this.renderTasks();
    }

    searchTasks(searchTerm) {
        this.searchTerm = searchTerm.toLowerCase();
        this.renderTasks();
    }

    getFilteredTasks() {
        let filteredTasks = [...this.tasks];

        // Apply search filter
        if (this.searchTerm) {
            filteredTasks = filteredTasks.filter(task => 
                task.title.toLowerCase().includes(this.searchTerm) ||
                task.category.toLowerCase().includes(this.searchTerm) ||
                task.status.toLowerCase().includes(this.searchTerm)
            );
        }

        // Apply category filter
        switch (this.currentFilter) {
            case 'high':
                filteredTasks = filteredTasks.filter(task => task.priority === 'High');
                break;
            case 'today':
                const today = new Date().toISOString().split('T')[0];
                filteredTasks = filteredTasks.filter(task => task.dueDate === today);
                break;
            case 'overdue':
                filteredTasks = filteredTasks.filter(task => 
                    !task.completed && this.isOverdue(task.dueDate)
                );
                break;
            case 'completed':
                filteredTasks = filteredTasks.filter(task => task.completed);
                break;
            case 'all':
            default:
                // No additional filtering
                break;
        }

        // Apply sorting
        filteredTasks.sort((a, b) => {
            switch (this.currentSort) {
                case 'priority':
                    const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                
                case 'status':
                    const statusOrder = { 'Pending': 3, 'In Progress': 2, 'Completed': 1 };
                    return statusOrder[b.status] - statusOrder[a.status];
                
                case 'category':
                    return a.category.localeCompare(b.category);
                
                case 'date':
                default:
                    return new Date(a.dueDate) - new Date(b.dueDate);
            }
        });

        return filteredTasks;
    }

    isOverdue(dueDate) {
        const today = new Date().toISOString().split('T')[0];
        return dueDate < today;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const dateOnly = date.toISOString().split('T')[0];
        const todayOnly = today.toISOString().split('T')[0];
        const tomorrowOnly = tomorrow.toISOString().split('T')[0];

        if (dateOnly === todayOnly) return 'Today';
        if (dateOnly === tomorrowOnly) return 'Tomorrow';
        
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    renderTasks() {
        const tasksContainer = document.getElementById('tasks-list');
        if (!tasksContainer) return;

        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            tasksContainer.innerHTML = `
                <div class="empty-state">
                    <h3>No tasks found</h3>
                    <p>Start by adding a new task or adjust your filters to see your tasks.</p>
                </div>
            `;
            return;
        }

        tasksContainer.innerHTML = filteredTasks.map(task => {
            const isOverdue = !task.completed && this.isOverdue(task.dueDate);
            const formattedDate = this.formatDate(task.dueDate);

            return `
                <div class="task-item ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}" data-task-id="${task.id}">
                    <div class="task-header">
                        <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-task-id="${task.id}"></div>
                        <div class="task-content">
                            <div class="task-title" data-task-id="${task.id}">${this.escapeHtml(task.title)}</div>
                            <div class="task-meta">
                                <span class="task-priority ${task.priority.toLowerCase()}">${task.priority}</span>
                                <span class="task-due-date ${isOverdue ? 'overdue' : ''}">${formattedDate}</span>
                                <span class="task-category">${task.category}</span>
                                <span class="task-status ${task.status.toLowerCase().replace(' ', '-')}">${task.status}</span>
                            </div>
                        </div>
                    </div>
                    <div class="task-actions">
                        <button class="task-edit-btn" data-task-id="${task.id}" title="Edit task">✎</button>
                        <button class="task-delete-btn" data-task-id="${task.id}" title="Delete task">×</button>
                    </div>
                </div>
            `;
        }).join('');

        // Add event listeners to the rendered tasks
        this.bindTaskEvents();
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    bindTaskEvents() {
        // Bind checkbox events
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const taskId = parseInt(e.target.dataset.taskId);
                console.log('Checkbox clicked for task:', taskId);
                this.toggleTaskComplete(taskId);
            });
        });

        // Bind title click events for editing
        document.querySelectorAll('.task-title').forEach(title => {
            title.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const taskId = parseInt(e.target.dataset.taskId);
                console.log('Task title clicked for edit:', taskId);
                this.editTask(taskId);
            });
        });

        // Bind edit button events
        document.querySelectorAll('.task-edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const taskId = parseInt(e.target.dataset.taskId);
                console.log('Edit button clicked for task:', taskId);
                this.editTask(taskId);
            });
        });

        // Bind delete button events
        document.querySelectorAll('.task-delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const taskId = parseInt(e.target.dataset.taskId);
                console.log('Delete button clicked for task:', taskId);
                this.deleteTask(taskId);
            });
        });
    }

    updateStats() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        const pendingTasks = this.tasks.filter(task => !task.completed).length;
        const overdueTasks = this.tasks.filter(task => 
            !task.completed && this.isOverdue(task.dueDate)
        ).length;
        const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // Update header stats
        const headerElements = {
            total: document.getElementById('header-total'),
            pending: document.getElementById('header-pending'),
            completed: document.getElementById('header-completed'),
            overdue: document.getElementById('header-overdue')
        };

        if (headerElements.total) headerElements.total.textContent = totalTasks;
        if (headerElements.pending) headerElements.pending.textContent = pendingTasks;
        if (headerElements.completed) headerElements.completed.textContent = completedTasks;
        if (headerElements.overdue) headerElements.overdue.textContent = overdueTasks;

        // Update progress bar
        const progressElements = {
            progressFill: document.getElementById('progress-fill'),
            progressText: document.getElementById('progress-text')
        };

        if (progressElements.progressFill) {
            progressElements.progressFill.style.width = `${progressPercentage}%`;
        }
        if (progressElements.progressText) {
            progressElements.progressText.textContent = `${progressPercentage}% Complete`;
        }
    }

    exportToCSV() {
        const csvHeaders = ['Title', 'Priority', 'Due Date', 'Category', 'Status', 'Completed'];
        const csvRows = this.tasks.map(task => [
            `"${task.title.replace(/"/g, '""')}"`,
            task.priority,
            task.dueDate,
            task.category,
            task.status,
            task.completed ? 'Yes' : 'No'
        ]);

        const csvContent = [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `professional-todo-tasks-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } else {
            alert('CSV export not supported in this browser');
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing Professional To-Do Manager');
    window.professionalTodoManager = new ProfessionalTodoManager();
});
