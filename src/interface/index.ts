import {
	type Edge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
export interface Column {
    id: string
    title: string
    cards: Card[]
}
export interface Card {
    id: string
    title: string
    description: string
    labels: string[]
}
  
export type Operation = {
	trigger: Trigger;
	outcome: Outcome;
}

export type Outcome =
	| {
			type: 'column-reorder';
			columnId: string;
			startIndex: number;
			finishIndex: number;
	  }
	| {
			type: 'card-reorder';
			columnId: string;
			startIndex: number;
			finishIndex: number;
	  }
	| {
			type: 'card-move';
			finishColumnId: string;
			itemIndexInStartColumn: number;
			itemIndexInFinishColumn: number;
	  };

export type Trigger = 'pointer' | 'keyboard';


export type ColumnDNDState = | { type: 'idle' }
| { type: 'is-card-over' }
| { type: 'is-column-over'; closestEdge: Edge | null }
| { type: 'generate-safari-column-preview'; container: HTMLElement }
| { type: 'generate-column-preview' };