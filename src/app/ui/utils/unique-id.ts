import { Injectable } from '@angular/core';

const counters = new Map<string, number>();

@Injectable({ providedIn: 'root' })
export class UniqueId {
  private static infix = `bui${Math.floor(Math.random() * 100000).toString()}`;

  /**
   * Generates a unique ID with a specific prefix.
   * @param prefix Prefix to add to the ID.
   * @param randomize Add a randomized infix string.
   */
  getId(prefix: string, randomize = false): string {
    let current = counters.get(prefix) ?? 0;

    current++;
    counters.set(prefix, current);

    return `${prefix}${randomize ? UniqueId.infix + '-' : ''}${current}`;
  }
}
