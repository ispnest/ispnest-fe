import { Listbox, Option } from '@angular/aria/listbox';
import { NgOptimizedImage, SlicePipe } from '@angular/common';
import { afterNextRender, Component, signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/list';
import { BuiDialog, BuiDialogBackdrop, BuiDialogBody, BuiDialogContent, BuiDialogPortal, BuiDialogTrigger } from '@/app/ui/dialog';

@Component({
  selector: 'DialogsCommandPalette',
  imports: [MatButton, BuiDialog, BuiDialogBackdrop, BuiDialogContent, BuiDialogPortal, BuiDialogTrigger, BuiDialogBody, MatIconButton, MatIcon, MatDivider, Listbox, Option, SlicePipe, NgOptimizedImage],
  template: `
    <div class="flex flex-auto flex-col items-center justify-center p-6">
      <!-- 'open' is bound for demo purposes. Remove when using in your project. -->
      <!-- 'autoFocus' is set to 'undefined' for demo purposes. Remove when using in your project. -->
      <div buiDialog [autoFocus]="undefined" [open]="dialogOpen()">
        <button matButton buiDialogTrigger>Open dialog</button>
        <ng-template buiDialogPortal>
          <div buiDialogBackdrop></div>
          <div buiDialogContent class="p-0 sm:w-xl sm:max-w-xl">
            <div buiDialogBody>
              <div class="flex flex-col">
                <!-- Search field -->
                <div class="relative flex items-center">
                  <mat-icon class="pointer-events-none absolute left-4 size-4" svgIcon="search" />
                  <input id="search" type="text" class="w-full pt-4 pr-14 pb-3.5 pl-10 outline-0" placeholder="Start typing to search..." />
                  <kbd class="absolute right-4">⌘/</kbd>
                </div>

                <mat-divider />

                <!-- Filters -->
                <div class="mt-4 flex items-start">
                  <div ngListbox class="flex flex-wrap items-center gap-2 px-4" orientation="horizontal" selectionMode="explicit" multi="true" [(values)]="selectedFilter">
                    @for (filter of filters; track filter.value) {
                      <div ngOption class="flex cursor-pointer items-center gap-x-1.5 rounded-md py-1 pr-2 pl-1.5 ring-1 ring-neutral-a6 hover:bg-neutral-a2 aria-selected:bg-neutral-a3" [value]="filter.value">
                        <mat-icon class="size-3.5" [svgIcon]="filter.icon" />
                        <div class="text-sm">{{ filter.label }}</div>
                      </div>
                    }
                  </div>

                  <!-- Spacer -->
                  <div class="flex-auto"></div>

                  <div class="flex items-center gap-x-1 pr-4">
                    <button matIconButton class="tiny">
                      <mat-icon svgIcon="list-filter" />
                    </button>

                    <button matIconButton class="tiny">
                      <mat-icon svgIcon="arrow-up-narrow-wide" />
                    </button>
                  </div>
                </div>

                <!-- Users -->
                <div class="mt-4 flex flex-col gap-y-2">
                  <div class="px-4 text-xs font-medium tracking-wide text-neutral-a11">USERS</div>
                  <div ngListbox class="flex flex-col gap-y-1 px-2.5" orientation="vertical" [readonly]="true">
                    @for (user of users; track user.id) {
                      <div ngOption class="flex h-9 cursor-pointer items-center gap-x-2 rounded-lg px-2 hover:bg-neutral-a3" [value]="user.id">
                        @if (user.photo) {
                          <img class="rounded-full object-cover" width="20" height="20" [ngSrc]="user.photo" [alt]="'Photo of ' + user.name" />
                        } @else {
                          <div class="flex size-5 items-center justify-center rounded-full bg-neutral-a3 text-xs font-medium text-neutral-a11">
                            {{ user.name | slice: 0 : 1 }}
                          </div>
                        }
                        <div class="flex items-center gap-x-1.5 truncate">
                          <div class="">{{ user.name }}</div>
                          <div class="text-neutral-a7">&bull;</div>
                          <div class="truncate text-sm text-neutral-a11">
                            {{ user.email }}
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                </div>

                <!-- Projects -->
                <div class="mt-4 flex flex-col gap-y-2">
                  <div class="px-4 text-xs font-medium tracking-wide text-neutral-a11">PROJECTS</div>
                  <div ngListbox class="flex flex-col gap-y-1 px-2.5" orientation="vertical" [readonly]="true">
                    @for (project of projects; track project.id) {
                      <div ngOption class="flex h-9 cursor-pointer items-center gap-x-2 rounded-lg px-2 hover:bg-neutral-a3" [value]="project.id">
                        @let color = project.data['colorClass'];
                        <div class="flex size-5 items-center justify-center">
                          <div class="size-2.5 rounded-full" [class]="color"></div>
                        </div>
                        <div class="truncate">{{ project.label }}</div>
                      </div>
                    }
                  </div>
                </div>

                <mat-divider class="my-4" />

                <!-- Quick actions -->
                <div class="flex flex-col gap-y-2">
                  <div class="px-4 text-xs font-medium tracking-wide text-neutral-a11">QUICK ACTIONS</div>
                  <div ngListbox class="flex flex-col gap-y-1 px-2.5" orientation="vertical" [readonly]="true">
                    <!-- Create project -->
                    <div ngOption class="flex h-9 cursor-pointer items-center gap-x-2 rounded-lg px-2 hover:bg-neutral-a3" value="create-task">
                      <div class="flex size-5 items-center justify-center">
                        <mat-icon class="size-4" svgIcon="folder-kanban" />
                      </div>
                      <div class="flex-auto">Create new project</div>
                      <kbd>⌘⇧P</kbd>
                    </div>

                    <!-- Create task -->
                    <div ngOption class="flex h-9 cursor-pointer items-center gap-x-2 rounded-lg px-2 hover:bg-neutral-a3" value="create-task">
                      <div class="flex size-5 items-center justify-center">
                        <mat-icon class="size-4" svgIcon="circle-check" />
                      </div>
                      <div class="flex-auto">Create new task</div>
                      <kbd>⌘⇧T</kbd>
                    </div>

                    <!-- Add new user -->
                    <div ngOption class="flex h-9 cursor-pointer items-center gap-x-2 rounded-lg px-2 hover:bg-neutral-a3" value="create-task">
                      <div class="flex size-5 items-center justify-center">
                        <mat-icon class="size-4" svgIcon="user-plus" />
                      </div>
                      <div class="flex-auto">Add new user</div>
                      <kbd>⌘⇧U</kbd>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="mt-4 flex items-center gap-x-4 border-t bg-neutral-a2 px-4 py-2">
                <!-- Navigate -->
                <div class="flex items-center">
                  <kbd class="flex items-center">
                    <mat-icon class="size-3" svgIcon="arrow-up-down" />
                  </kbd>
                  <span class="ml-2 text-sm text-neutral-a11">Navigate</span>
                </div>

                <!-- Select -->
                <div class="flex items-center">
                  <kbd class="flex items-center">
                    <mat-icon class="size-3" svgIcon="corner-down-left" />
                  </kbd>
                  <span class="ml-2 text-sm text-neutral-a11">Select</span>
                </div>

                <!-- Close -->
                <div class="flex items-center">
                  <kbd class="flex items-center">
                    <mat-icon class="size-3" svgIcon="circle-arrow-out-up-left" />
                  </kbd>
                  <span class="ml-2 text-sm text-neutral-a11">Close</span>
                </div>

                <!-- Spacer -->
                <div class="flex-auto"></div>

                <!-- Settings -->
                <button matIconButton>
                  <mat-icon svgIcon="settings" />
                </button>
              </div>
            </div>
          </div>
        </ng-template>
      </div>
    </div>
  `,
})
export class DialogsCommandPalette {
  // Demo state. Remove when using in your project.
  protected readonly dialogOpen = signal(false);
  constructor() {
    afterNextRender(() => {
      this.dialogOpen.set(true);
    });
  }

  // Data
  readonly users = [
    {
      id: 'DET3VJa6rYQeejyiYrH7E',
      name: 'Evan Gutmann',
      photo: '/images/photos/i26glj5ogfrlo5mhggfx2.jpg',
      email: 'evan.gutmann@example.com',
    },
    {
      id: 'EpGBfbV3DrkiXZqWRpm6x',
      name: 'Gloria Metz',
      photo: '/images/photos/kol3jpdula4mvn74wdnns.jpg',
      email: 'gloria.metz@example.com',
    },
    {
      id: 'dadABDjRU8GxXEcpybCRK',
      name: 'Lance Parisian',
      photo: null,
      email: 'lance.parisian@example.com',
    },
    {
      id: 'NnJZrLRZNRHLKnQefefWx',
      name: 'Lowell Lind',
      photo: '/images/photos/x05ipzq7r4helr3lzaatp.jpg',
      email: 'lowell.lind@example.com',
    },
    {
      id: 'B9Vi9KkbHFBqhdcUnejLh',
      name: 'Alton Rutherford',
      photo: null,
      email: 'alton.rutherford@example.com',
    },
  ];
  readonly projects = [
    {
      id: 'builderkit',
      label: 'BuilderKit',
      data: {
        colorClass: 'bg-[var(--color-crimson-9)]',
      },
    },
    {
      id: 'spark',
      label: 'Spark',
      data: {
        colorClass: 'bg-[var(--color-jade-9)]',
      },
    },
    {
      id: 'horizon',
      label: 'Horizon',
      data: {
        colorClass: 'bg-[var(--color-sky-9)]',
      },
    },
    {
      id: 'nova',
      label: 'Nova',
      data: {
        colorClass: 'bg-[var(--color-purple-9)]',
      },
    },
  ];

  // State
  protected selectedFilter = signal(['projects', 'tasks', 'users']);
  protected filters = [
    {
      value: 'projects',
      label: 'Projects',
      icon: 'folder-kanban',
    },
    {
      value: 'tasks',
      label: 'Tasks',
      icon: 'list-todo',
    },
    {
      value: 'users',
      label: 'Users',
      icon: 'users',
    },
    {
      value: 'logs',
      label: 'Logs',
      icon: 'logs',
    },
    {
      value: 'settings',
      label: 'Settings',
      icon: 'settings',
    },
  ];
}
