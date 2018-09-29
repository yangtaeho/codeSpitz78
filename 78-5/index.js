const err = v=>{
  throw v; // 이 것만 프로덕에서 console.log 로 바꾸면 된다.
};

/** 1 */
if(1) {

  const TRUE = {}, FALSE = {};
  
  const Task = class{
    constructor(title, isCompleted = false) {
      this.title = title;
      this.isCompleted = FALSE;
      // 1. 뮤터블 객체에 대해서는 값을 쓸지 객체 값으로 쓸지 의사결정이 필요하다.
      // 2. FALSE, TRUE 라는 참조형을 통해 타입 체크 등이 가능해짐.
      //this.isCompleted = 'PROCESS'; // 뮤터블이 가질 값을 정확히 지정하고 싶으면 레퍼런스나 열거형을 써야한다. 아니면 이와 같이 무한한 값이 올 수 있다.
    }
  };
}

if(2) {
/*
값 컨텍스트 사용
*/
  
  const Task = class{
    constructor(title, isCompleted = false) {
      this.title = title;
      this.isCompleted = isCompleted;
      // this.id = getUUID(); // 이런거 쓰면 함수형이 아니게 된다. new 를 이용해서 만들어서 메모리 주소 식별을 하는게 맞는 방법.
    }
    setTitle(title) {
      // this.title = title;
      return new Task(title, this.isCompleted);
    }
    toggle(){
      // this.isCompleted = !this.isCompleted;
      return new Task(this.title, !this.isCompleted);
    }
    //뮤터블이든 이뮤터블이든 한 가지 방법으로만 만들어야 한다.
    //이뮤터블로 만들 경우 다른 쓰레드로부터 객체 참조 안종성 확보, 오염 방지 등의 기능이 쓰인다.
    // 값 컨텍스트를 부른다. 라고 한다.

    // isEqual(task){
    //   return task.title == this.title && task.isCompleted;
    // }
  };

}

/*
객체 컨텍스트 사용
*/

const Task = class{
  constructor(title) {
    this.title = title;
    this.isCompleted = false;
  }
  setTitle(title) {
    this.title = title;
  }
  toggle(){
    this.isCompleted = !this.isCompleted;
  }
  
  // 객체 컨텍스트를 쓰지 않는 경우 값 컨텍스트를 사용한다??
  // 동일한 값이 여러개 존재할 수 있다면 값 컨텍스트를 사용해선 안된다.

  getInfo(){
    // 현재 상태에 대한 스냅샷을 알려주는 것이기 때문에 새 객체를 만들어서 넘김.
    // 런 타임에 대한 에러가 일어나면 잡기 어렵다.
    return { title: this.title, isCompleted: this.isCompleted};
  }
};

// 주체.
()=> {
  let isOkay = true;
  const task = new Task('test1');
  isOkay = task.getInfo().title == 'test1' && task.getInfo().isCompleted == false;
  console.log('test1',isOkay);
  task.toggle(); // toggle 의 외부에서의 목적은 getInfo 했을 때 isCompleted 의 바뀐 값을 보고 싶은 것. 내부에서는 단지 isCompleted 를 토글하는 것 뿐임.
  isOkay = task.getInfo().title == 'test1' && task.getInfo().isCompleted == true;
  console.log('test2',isOkay);
}

//코드를 짜고 확인하지 않으면 락앤락에 담아 놓은 먹다 남은 식빵처럼 열어보기 두렵게 된다. 락앤락 통째로 버려야 하는상황이 발생한다.

// 객체지향에서 주체가 핵심이다. 객체만으로는 아무런 가치도 발생하지 않는다. 호스트(주체) 가  이용할 때 가치가 발생함.
// 객체 지향 디자인의 가장 중점인 부분은 호스트가 어떻게 쓰느냐임.
// 라이브러리를 쓸때도 마찬가지로 실제 구현 코드가 어떤지를 보는게 훨씬 빠르게 이해 되는 이유임.


// 폴더에 태스크만 소용하는 배열을 만들면 된다..?

const Folder = class{
  constructor(title){
    this.title = title;
    this.tasks = new Set(); // 중복 객체가 들어갈 수 없음.
  }
  getTitle() {
    return this.title;
  }
  setTitle(title) {
    this.title = title;
  }
  // addTask(title, isComplete, upload, writer){ //잘못된 
  // }
  // addTask(title){
  //   // 다른 폴더의 태스크를 가져올 수 없다. 외부 커플링이 발생하기 때문에..
  //   // 폴더의 이동은 없다.
  //   this.tasks.add(new Task(title));
  // }
  addTask(task){
    // 나는 태스크를 가두기만 할 거다.. 라는 의도
    if(!(task instanceof Task)) err('invalid task');
    this.tasks.add(task);
  }
  // title 을 받는게 좋을까 task 를 받는게 좋을까? 
  // 왜 title 을 받아서 new Task 를 하는게 좋을까.
  // 디자인 상에서 태스크를 만들 수 있는 건 폴더 이니까 태스크는 폴더만 알면 된다. 
  // 그래서 태스크 자체를 외부로부터 은닉할 수 있다.

  removeTask(task){
    if(!(task instanceof Task)) err('invalid task');
    this.tasks.delete(task); // 키워드가 . 구문으로 쓸 수도 있다.
  }
  // 이걸 만들어보니 addTask 가 title 을 받는 건 말이 안된다고 보여진다.대칭성에 위배된다.

  getTasks(){ // 범용이름은 훌륭한 분들이 쓰고.. 우리는 구체 명을 쓴다..
    return [...this.tasks.values()];
  }
};

// folder 갖고 놀기

(()=> {
  let isOkay = true;
  const task = new Task('task1');
  const folder = new Folder('folder1');

  isOkay = folder.getTasks().length == 0;
  console.log('test1',isOkay);
  folder.addTask(task);
  folder.addTask(task);
  isOkay = folder.getTasks().length ==1 && folder.getTasks()[0].getInfo().title == 'task1';
  console.log('test2',isOkay);
  folder.addTask(task);
  isOkay = folder.getTasks().length ==1 && folder.getTasks()[0].getInfo().title == 'task1';
  console.log('test3',isOkay);
});

const App = class{
  constructor(){
    this.folders = new Set();
  }
  addFolder(folder){
    if(!(folder instanceof Folder)) err('invalid folder');
    this.folders.add(folder);
  }
  removeFolder(folder){
    if(!(folder instanceof Folder)) err('invalid folder');
    this.folders.delete(folder);
  }
  getFolders(){
    return [...this.folders.values()];
  }
};


const Renderer = class{
  constructor(app){
    this.app = app;
  }
  render(){
    this._render();
  }
  _render(){
    err('must be overrided');
  }
};
const el = (tag)=>document.createElement(tag);
const DOMRenderer = class extends Renderer {
  constructor(parent, app){
    super(app);
    // this.el = el('main'); // body 에 딱 한 번만 나올 수 있는 html5 태그
    this.el = parent.appendChild(el('section'));
    this.el.innerHTML = `
      <nav>
        <input type="text">
        <ul></ul>
      </nav>
      <section>
        <header>
          <h2></h2> <!-- 구형 브라우저에서는 h1이 한 번만 나올 수 있기 때문에 h2를 사용함. -->
          <input type="text">
        </header>
        <ul></ul>
      </section>
    `;
    this.el.querySelector('nav').style.cssText = 'float:left; width:200px; border-right: 1px solid #000';
    this.el.querySelector('section').style.cssText = 'margin-left:210px';
    const ul = this.el.querySelectorAll('ul');
    this.folder = ul[0];
    this.task = ul[1];
    this.currentFolder = null;
    const input = this.el.querySelectorAll('input');
    input[0].addEventListener('keyup',e=>{
      if(e.keyCode != 13) return;
      const v = e.target.value.trim();
      if(!v) return;
      const folder = new Folder(v);
      this.app.addFolder(folder);
      this.currentFolder = folder;
      e.target.value = '';
      this.render();
    });
    input[1].addEventListener('keyup',e=>{
      if(e.keyCode != 13 || !this.currentFolder) return;
      const v = e.target.value.trim();
      if(!v) return;
      const task = new Task(v);
      this.currentFolder.addTask(task);
      e.target.value = '';
      this.render();
    });
  }
  _render(){
    const folders = this.app.getFolders();
    if(!this.currentFolder) this.currentFolder =  folders[0];
    this.folder.innerHTML = '';
    folders.forEach(f => {
      const li = el('li');
      li.innerHTML = f.getTitle();
      li.style.cssText = 'font-size:'+(this.currentFolder == f?'20px':'12px');
      li.addEventListener('click',()=>{
        this.currentFolder = f;
        this.render(); //여기는 그냥 때리고.. 실제 구현체를 잘 짜면 됨.
      });
      this.folder.appendChild(li);
    });
    if(!this.currentFolder)return;
    this.task.innerHTML = '';
    this.currentFolder.getTasks().forEach(t=>{
      const li = el('li');
      const {title,isCompleted} = t.getInfo();
      li.innerHTML = (isCompleted? "completed ":"process ")+title;
      li.style.cssText = 'font-size:'+(this.currentFolder == t?'20px':'12px');
      li.addEventListener('click',()=>{
        t.toggle();
        this.render();
      });
      this.task.appendChild(li);
    });
  }
};

new DOMRenderer(document.body, new App());