import { Tree, TreeItem, TreeItemGroup } from '@angular/aria/tree';
import { NgTemplateOutlet } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { Media } from '@/app/core/media';
import { BuiSidebar, BuiSidebarBody, BuiSidebarButton, BuiSidebarIcon, BuiSidebarLabel, BuiSidebarMenu, BuiSidebarMenuItem, BuiSidebarMenuRow, BuiSidebarSection, BuiSidebarSectionContent, BuiSidebarSectionHeader } from '@/app/ui/sidebar';

type TreeNode = {
  name: string;
  value: string;
  children?: TreeNode[];
  expanded?: boolean;
};

@Component({
  selector: 'SidebarPanelFileTree',
  imports: [MatIcon, MatIconButton, MatSidenav, MatSidenavContainer, MatSidenavContent, Tree, TreeItemGroup, TreeItem, NgTemplateOutlet, BuiSidebar, BuiSidebarBody, BuiSidebarSection, BuiSidebarSectionHeader, BuiSidebarLabel, BuiSidebarSectionContent, BuiSidebarMenu, BuiSidebarMenuItem, BuiSidebarButton, BuiSidebarIcon, BuiSidebarMenuRow],
  template: `
    <ng-template #treeNodes let-nodes="nodes" let-parent="parent">
      @for (node of nodes; track node.value) {
        <li buiSidebarMenuItem ngTreeItem class="flex items-center" [parent]="parent" [value]="node.value" [label]="node.name" [disabled]="node.disabled" [(expanded)]="node.expanded" #treeItem="ngTreeItem">
          <div buiSidebarMenuRow>
            <button buiSidebarButton [class.active]="treeItem.selected()">
              @if (node.children && node.children.length > 0) {
                <mat-icon buiSidebarIcon [svgIcon]="treeItem.expanded() ? 'folder-open' : 'folder'" />
              } @else {
                <mat-icon buiSidebarIcon svgIcon="file" />
              }

              <span buiSidebarLabel>{{ node.name }}</span>
            </button>
          </div>
        </li>

        @if (node.children && node.children.length > 0) {
          <ul buiSidebarMenu role="group" class="empty:hidden">
            <ng-template ngTreeItemGroup [ownedBy]="treeItem" #group="ngTreeItemGroup">
              <ng-template [ngTemplateOutlet]="treeNodes" [ngTemplateOutletContext]="{ nodes: node.children, parent: group }" />
            </ng-template>
          </ul>
        }
      }
    </ng-template>

    <mat-sidenav-container>
      <mat-sidenav [mode]="isMobile() ? 'over' : 'side'" [opened]="!isMobile()" #sidenav>
        <!-- Sidebar -->
        <div buiSidebar>
          <!-- Body -->
          <div buiSidebarBody class="pt-4">
            <div buiSidebarSection>
              <div buiSidebarSectionHeader>
                <span buiSidebarLabel>Project</span>
              </div>
              <div buiSidebarSectionContent>
                <ul buiSidebarMenu ngTree #projectTree="ngTree">
                  <ng-template [ngTemplateOutlet]="treeNodes" [ngTemplateOutletContext]="{ nodes: project, parent: projectTree }" />
                </ul>
              </div>
            </div>
          </div>
        </div>
      </mat-sidenav>

      <mat-sidenav-content>
        <!-- Toolbar -->
        <div class="flex items-center gap-x-4 border-b p-4">
          <button matIconButton (click)="sidenav.toggle()">
            <mat-icon svgIcon="panel-left" />
          </button>
        </div>

        <!-- Content -->
        <div class="flex flex-auto p-6">
          <div class="flex-auto rounded-md border-2 border-dashed p-4"></div>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
})
export class SidebarPanelFileTree {
  // Dependencies
  private readonly media = inject(Media);

  // State
  protected readonly isMobile = this.media.match(`(max-width: 767px)`);
  protected project: TreeNode[] = [
    {
      name: 'public',
      value: 'public',
      children: [{ name: 'favicon.ico', value: 'public/favicon.ico' }],
      expanded: false,
    },
    {
      name: 'src',
      value: 'src',
      children: [
        {
          name: 'app',
          value: 'src/app',
          children: [
            { name: 'app.config.server.ts', value: 'src/app/app.config.server.ts' },
            { name: 'app.config.ts', value: 'src/app/app.config.ts' },
            { name: 'app.routes.server.ts', value: 'src/app/app.routes.server.ts' },
            { name: 'app.routes.ts', value: 'src/app/app.routes.ts' },
            { name: 'app.spec.ts', value: 'src/app/app.spec.ts' },
            { name: 'app.ts', value: 'src/app/app.ts' },
          ],
          expanded: true,
        },
        { name: 'index.html', value: 'src/index.html' },
        { name: 'main.server.ts', value: 'src/main.server.ts' },
        { name: 'main.ts', value: 'src/main.ts' },
        { name: 'server.ts', value: 'src/server.ts' },
        { name: 'styles.css', value: 'src/styles.css' },
      ],
      expanded: true,
    },
    { name: 'angular.json', value: 'angular.json' },
    { name: 'package.json', value: 'package.json' },
    { name: 'README.md', value: 'README.md' },
  ];
}
