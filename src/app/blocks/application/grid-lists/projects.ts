import { DatePipe, NgOptimizedImage, SlicePipe, TitleCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatProgressBar } from '@angular/material/progress-bar';

type ProjectStatus = 'active' | 'on-hold' | 'completed';
type ProjectMember = {
  name: string;
  photo: string | null;
};
type Project = {
  id: string;
  title: string;
  description: string;
  category: string;
  members: ProjectMember[];
  progress: number;
  status: ProjectStatus;
  dueDate: string;
};

const projects: Project[] = [
  {
    id: '1',
    title: 'Alpha Centauri',
    description: 'An innovative project focused on AI development and automation solutions.',
    category: 'AI',
    members: [
      { name: 'Gloria Metz', photo: 'qzxtybs14pzdxhsxmt56d.jpg' },
      { name: 'Seth Moore', photo: 'ygjb13iue7ikmnf20eezd.jpg' },
      { name: 'Stuart Schultz', photo: null },
      { name: 'Brenda Lesch', photo: 'n67qrx4tch0n9yhstgqfq.jpg' },
      { name: 'Derek Kutch', photo: null },
    ],
    progress: 75,
    status: 'active',
    dueDate: '2025-12-01',
  },
  {
    id: '2',
    title: 'Horizon Dashboard',
    description: 'A next-gen dashboard experience designed for enterprise analytics.',
    category: 'Dashboard',
    members: [
      { name: 'Felix Casper', photo: 'gbvj3tj22nwuihpgko902.jpg' },
      { name: 'Grace Botsford', photo: 'm353ex5wbce1xwjx4adve.jpg' },
      { name: 'Helen Kihn', photo: null },
    ],
    progress: 40,
    status: 'on-hold',
    dueDate: '2025-11-18',
  },
  {
    id: '3',
    title: 'Nimbus Platform',
    description: 'Cloud infrastructure optimization for high-availability workloads.',
    category: 'Infrastructure',
    members: [
      { name: 'Ivy Hermiston', photo: 'czhkkxemt8hqp1wl296t5.jpg' },
      { name: 'Jack Osinski', photo: 'fpooxhjilh4pj36894qf4.jpg' },
      { name: 'Karen Lind', photo: 'aqvge5v3422q14wmhihyf.jpg' },
    ],
    progress: 60,
    status: 'active',
    dueDate: '2025-11-30',
  },
  {
    id: '4',
    title: 'Pulse Analytics',
    description: 'Internal analytics tool tracking engagement and retention metrics.',
    category: 'Analytics',
    members: [
      { name: 'Mia Gutmann', photo: 'pl8wjbsdooqi8hnxc8u7t.jpg' },
      { name: 'Olivia Yundt', photo: null },
      { name: 'Noah Balistreri', photo: 'p73mldwg6lpticdnfgryy.jpg' },
      { name: 'Paul Ryan', photo: 'ot79dx7wxgnj6ixi0aszt.jpg' },
    ],
    progress: 90,
    status: 'active',
    dueDate: '2025-12-15',
  },
  {
    id: '5',
    title: 'Vertex CRM',
    description: 'Customer relationship management system with integrated AI features.',
    category: 'CRM',
    members: [
      { name: 'Gloria Metz', photo: 'qzxtybs14pzdxhsxmt56d.jpg' },
      { name: 'Seth Moore', photo: 'ygjb13iue7ikmnf20eezd.jpg' },
      { name: 'Olivia Yundt', photo: null },
      { name: 'Noah Balistreri', photo: 'p73mldwg6lpticdnfgryy.jpg' },
      { name: 'Paul Ryan', photo: 'ot79dx7wxgnj6ixi0aszt.jpg' },
    ],
    progress: 100,
    status: 'completed',
    dueDate: '2025-10-15',
  },
];

@Component({
  selector: 'GridListProjects',
  imports: [MatCard, MatProgressBar, TitleCasePipe, MatIconButton, MatIcon, MatMenu, MatMenuItem, MatMenuTrigger, MatDivider, DatePipe, SlicePipe, NgOptimizedImage],
  template: `
    <div class="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
      @for (project of projects; track project.id) {
        <mat-card class="flex flex-col p-6">
          <div class="flex items-center gap-x-4">
            <!-- Category -->
            <div class="rounded bg-neutral-a4 px-1.5 py-0.5 text-xs font-medium text-neutral-a11">{{ project.category }}</div>

            <!-- Menu -->
            <button matIconButton [matMenuTriggerFor]="projectMenu" class="small ml-auto">
              <mat-icon svgIcon="ellipsis-vertical" />
            </button>
            <mat-menu #projectMenu="matMenu">
              <button mat-menu-item>
                <mat-icon svgIcon="pencil" />
                Edit
              </button>
              <button mat-menu-item>
                <mat-icon svgIcon="archive" />
                Archive
              </button>
              <mat-divider />
              <button mat-menu-item>
                <mat-icon svgIcon="trash" />
                Delete
              </button>
            </mat-menu>
          </div>

          <!-- Title -->
          <div class="mt-5 text-xl font-medium tracking-tight">{{ project.title }}</div>

          <!-- Description -->
          <div class="mt-1 line-clamp-2 text-neutral-a11">{{ project.description }}</div>

          <!-- Spacer -->
          <div class="flex-auto"></div>

          <!-- Progress & Status -->
          <div class="mt-6 flex items-center justify-between gap-x-4">
            <div class="text-sm">{{ project.progress }}% complete</div>
            @if (project.status === 'on-hold' || project.status === 'completed') {
              <div
                class="rounded px-1.5 py-0.5 text-xs font-medium"
                [class]="{
                  'bg-amber-a4': project.status === 'on-hold',
                  'text-amber-a11': project.status === 'on-hold',
                  'bg-green-a4': project.status === 'completed',
                  'text-green-a11': project.status === 'completed',
                }"
              >
                {{ project.status | titlecase }}
              </div>
            }
          </div>
          <mat-progress-bar class="mt-1.5" [value]="project.progress" />

          <div class="mt-6 flex items-center justify-between gap-x-4">
            <!-- Members -->
            <div class="flex items-center -space-x-1">
              @for (member of project.members | slice: 0 : 3; track member.name) {
                @if (member.photo) {
                  <img [ngSrc]="'/images/photos/' + member.photo" width="24" height="24" [alt]="member.name" class="rounded-full object-cover ring-2 ring-white outline -outline-offset-1 outline-black-a3 dark:ring-neutral-2 dark:outline-white-a3" />
                } @else {
                  <div class="flex size-6 items-center justify-center rounded-full bg-neutral-4 text-xs font-medium text-neutral-a11 ring-2 ring-white outline -outline-offset-1 outline-black-a1 dark:ring-neutral-2 dark:outline-white-a1">
                    {{ member.name | slice: 0 : 1 }}
                  </div>
                }
              }

              @if (project.members.length > 3) {
                <div class="flex size-6 items-center justify-center rounded-full bg-neutral-4 text-xs font-medium text-neutral-a11 tabular-nums ring-2 ring-white outline -outline-offset-1 outline-black-a1 dark:ring-neutral-2 dark:outline-white-a1">+{{ project.members.length - 3 }}</div>
              }
            </div>

            <!-- Due date -->
            <div class="flex items-center gap-x-1">
              <mat-icon svgIcon="calendar-check-2" class="size-3" />
              <div class="text-sm whitespace-nowrap">{{ project.dueDate | date: 'mediumDate' }}</div>
            </div>
          </div>
        </mat-card>
      }
    </div>
  `,
})
export class GridListProjects {
  // Data
  protected projects = projects;
}
