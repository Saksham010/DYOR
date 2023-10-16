export interface FetchedResponseInterface {
    method: string;
    params: { data: any,to:any }[]; // Specify the structure of params
    chainid: string;
}
  