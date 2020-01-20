export type Recursive<T> = ((T | Recursive<T>)[] | T);
export type RecursiveBuffer = Recursive<Buffer>;
