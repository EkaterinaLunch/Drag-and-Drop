
//Project Type
enum ProjectStatus {
    Active,
    Finished
}

class Project {
    constructor(
        public id: string,
        public title: string,
        public description: string,
        public people: number,
        public status: ProjectStatus
    ) {}
}

//Project State Managment
type Listener<T> = (items: T[]) => void;

class State<T> {
    protected listeners: Listener<T>[] = [];

    addListener(listenerFunc: Listener<T>) {
        this.listeners.push(listenerFunc);
    }
}

class ProjectState extends State<Project>{
    private projects: Project[] = [];
    private static instance: ProjectState;

    private constructor() {
        super();
    }

    static getInstance() {
        if (this.instance) {
            return this.instance
        }

        this.instance = new ProjectState();
        return this.instance;
    }

    addProject(title: string, description: string, numOfPeople: number) {
        const newProject = new Project(
            Math.random().toString(),
            title,
            description,
            numOfPeople,
            ProjectStatus.Active,
        )
        this.projects.push(newProject);
        for (const listenerFuns of this.listeners) {
            listenerFuns(this.projects.slice())
        }
    }
}

const projectState = ProjectState.getInstance(); //  We guarantee to always work with exact same object and will always have one object of the type in the entire application 

//Validation
interface Validateble {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

function validate(validatableInput: Validateble) {
    let isValid = true;

    if (validatableInput.required) {
        isValid = isValid && validatableInput.value.toString().trim().length !== 0;
    }
    if (validatableInput.minLength != null && typeof validatableInput.value === 'string') {
        isValid = isValid && validatableInput.value.length >= validatableInput.minLength;
    }
    if (validatableInput.maxLength != null && typeof validatableInput.value === 'string') {
        isValid = isValid && validatableInput.value.length <= validatableInput.maxLength;
    }
    if (validatableInput.min != null && typeof validatableInput.value === 'number') {
        isValid = isValid && validatableInput.value >= validatableInput.min;
    }
    if (validatableInput.max != null && typeof validatableInput.value === 'number') {
        isValid = isValid && validatableInput.value <= validatableInput.max;
    }

    return isValid;
}

//autobind
function autobind(
    _target: Object,
    _methodName: string,
    descriptor: PropertyDescriptor
) {
    const originalMethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    }
    return adjDescriptor;
}

//Component Base Class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement;
    hostElement: T;
    element: U;

    constructor(
        templateID: string,
        hostElementID: string,
        insertAtStart: boolean,
        newElementID?: string,
    ) {
        this.templateElement = document.getElementById(templateID)! as HTMLTemplateElement;
        this.hostElement = document.getElementById(hostElementID)! as T;

        const importNode = document.importNode(
            this.templateElement.content,
            true
        )

        this.element = importNode.firstElementChild as U;
        if (newElementID) {
            this.element.id = newElementID;
        }

        this.attach(insertAtStart);
    }

    private attach(insertAtStart: boolean) {
        this.hostElement.insertAdjacentElement(insertAtStart ? 'afterbegin' : 'beforeend', this.element);
    }

    abstract configure(): void;
    abstract renderContent(): void;
}

class ProjectList extends Component<HTMLDivElement, HTMLElement> {
    assignedProjects: Project[];

    constructor(private type: 'active' | 'finished') {
        super("project-list", "app", false, `${type}-projects`);
        this.assignedProjects = [];

        this.configure();
        this.renderContent();
    }

    configure() {
        projectState.addListener((projects: Project[]) => {
            const relevantProjects = projects.filter(prj => {
                if (this.type === 'active') {
                    return prj.status === ProjectStatus.Active;
                }
                return prj.status === ProjectStatus.Finished;
            })
            this.assignedProjects = relevantProjects;
            this.renderProjects();
        });
    }

    renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
    }

    private renderProjects() {
        const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
        listEl.innerHTML = '';
        for (const prjItem of this.assignedProjects) {
            const listItem = document.createElement('li');
            listItem.textContent = prjItem.title;
            listEl.appendChild(listItem);
        }
    }
}

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleIputElement: HTMLInputElement;

    constructor() {
        super("project-input", "app", true, "user-input");

        this.titleInputElement = this.element.querySelector('#title')! as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
        this.peopleIputElement = this.element.querySelector('#people') as HTMLInputElement;
        
        this.configure();
    }

    configure() {
        this.element.addEventListener('submit', this.submitHandler.bind(this));
    }

    renderContent() {}

    private clearInputs() {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleIputElement.value = '';
    }

    private gatherUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleIputElement.value;

        const titleValidatable: Validateble = {
            value: enteredTitle,
            required: true
        }
        const descriptionValidatable: Validateble = {
            value: enteredDescription,
            required: true,
            minLength: 5
        }
        const peopleValidatable: Validateble = {
            value: enteredPeople,
            required: true,
            min: 1,
            max: 5
        }

        if (
            !validate(titleValidatable) ||
            !validate(descriptionValidatable) ||
            !validate(peopleValidatable)
            ) {
            alert('Invalid value, please try again!');
            return;
        } else {
            return [enteredTitle, enteredDescription, parseInt(enteredPeople)];
        }
    }

    private submitHandler(event: Event) {
        event.preventDefault();
        console.log(this.titleInputElement);
        const userInput = this.gatherUserInput();

        if (Array.isArray(userInput)) {
            const [title, description, people] = userInput;
            projectState.addProject(title, description, people);
            this.clearInputs();
        }
    }
}

const prjInput = new ProjectInput();
const activePrjList = new ProjectList('active');
const finishedPrjList = new ProjectList('finished');