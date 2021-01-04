export class Frame {
  public readonly image: String;
  public date: Date;
  public FaceData: any;
  public BodyData: any;
  public people: string[];
  public ProhibitedItemData: any;
  constructor(image: string) {
    this.image = image;
    this.date = new Date();
    this.FaceData = []
    this.BodyData = []
    this.people = []
    this.ProhibitedItemData = []
  }
}

export class FrameQueue {
    data: Frame[];
    capacity: number;
    constructor(capacity: number) {
      this.data = [];
      this.capacity = capacity;
    }
  
    isFull() {
      return this.data.length === this.capacity;
    }

    size() {
      return this.data.length;
    }
  
    isEmpty() {
      return this.data.length === 0;
    }
  
    enqueue(item: Frame): boolean {
      if (this.isFull()) return false;
  
      this.data.push(item);
      return true;
    }
  
    dequeue() {
      if (this.isEmpty()) return undefined;
  
      return this.data.shift();
    }
  
    lastElement() {
      if (this.isEmpty()) return null;
  
      return this.data[this.data.length - 1];
    }
  
    clear() {
      this.data = [];
    }
  }