export interface Annotation {
  type: string;
  end_index: number;
  start_index: number;
  title: string;
  url: string;
}

export interface ChunkSequence {
  type: string;
  count: number;
  content: string;
  part?: {
    annotations?: Annotation[];
    type?: string;
    text?: string;
  };
}

export interface ApiChunk {
  type: string;
  content: string;
  delta?: string;
  part?: {
    annotations?: Annotation[];
  };
}
