// ==UserScript==
// @name         jzyz-作业/比赛跳转（题库版）
// @version      1.1
// @description  在题库题目页添加跳转到作业或比赛题目的按钮，支持多目标弹窗选择
// @author       User
// @match        *://172.20.6.60/*
// @match        *://wn.code-fans.cn:5678/*
// @match        *://ng.code-fans.cn:5678/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';
  var url = window.location.href;

  async function JZYZ_JumpToRelated() {
      // 提取域名和题号
      const match = url.match(/\/d\/([^\/]+)\/p\/([^\/\?]+)/);
      if (!match) return;
      const domain = match[1];
      const pid = match[2];

      // 如果本身就带着tid（已经在作业或比赛里），提示一下
      if (url.includes('?')) {
          alert('当前已经在作业或比赛中了，无需跳转！');
          return;
      }

      // 提取“相关”区域中的作业和比赛链接
      const homeworkArea = document.querySelector('.section.side.visible .section__body.typo');
      let options = [];

      if (homeworkArea) {
          const links = homeworkArea.querySelectorAll('a');
          links.forEach(link => {
              const href = link.href || '';
              // 识别作业
              let idMatch = href.match(/homework\/([a-zA-Z0-9]+)/);
              if (idMatch) {
                  options.push({
                      type: '作业',
                      id: idMatch[1],
                      name: link.textContent.trim() || '未命名作业'
                  });
                  return; // 跳过剩下的匹配
              }
              // 识别比赛
              idMatch = href.match(/contest\/([a-zA-Z0-9]+)/);
              if (idMatch) {
                  options.push({
                      type: '比赛',
                      id: idMatch[1],
                      name: link.textContent.trim() || '未命名比赛'
                  });
              }
          });
      }

      if (options.length === 0) {
          alert('当前题目未出现在任何作业或比赛中！');
          return;
      }

      // 只有一个目标（不管作业还是比赛）时直接跳转
      if (options.length === 1) {
          window.location.href = `/d/${domain}/p/${pid}?tid=${options[0].id}`;
          return;
      }

      // 有多个目标时弹出窗口让用户选择
      let msg = "该题目出现在以下内容中，请输入编号选择要跳转的目标：\n\n";
      options.forEach((opt, index) => {
          msg += `${index + 1}. [${opt.type}] ${opt.name}\n`;
      });

      const choice = prompt(msg, "1");
      if (choice !== null) {
          const idx = parseInt(choice, 10) - 1;
          if (idx >= 0 && idx < options.length) {
              window.location.href = `/d/${domain}/p/${pid}?tid=${options[idx].id}`;
          } else {
              alert('无效的编号，已取消跳转。');
          }
      }
  }

  async function initButton() {
      // 创建按钮元素
      const li = document.createElement('li');
      li.className = 'menu__item nojs--hide';

      const a = document.createElement('a');
      a.className = 'menu__link';
      a.setAttribute('name', 'problem-to-related');

      // 使用通用的图标或用户模版中的图标
      const span = document.createElement('span');
      span.className = 'icon icon-award';

      const text = document.createTextNode('跳转到相关作业/比赛');

      a.appendChild(span);
      a.appendChild(text);
      li.appendChild(a);

      // 查找“递交”按钮，并将新按钮插入到其下方
      const menu = document.querySelector('.menu');
      if (menu) {
          const submitItem = [...document.querySelectorAll('.menu__item')].find(el => el.textContent.includes('递交'));
          if (submitItem && submitItem.parentNode) {
              // 插入到递交按钮之后
              submitItem.parentNode.insertBefore(li, submitItem.nextSibling);
          } else {
              // 找不到“递交”就直接追加到最下方
              menu.appendChild(li);
          }
      }

      // 绑定点击事件
      li.addEventListener('click', async function () {
          await JZYZ_JumpToRelated();
      });
  }

  // 检查页面环境，确保是题目详情页
  function checkUiContext() {
      const allScript = document.querySelectorAll('script');
      for (const node of allScript) {
          if (node.textContent.includes('UiContext')) {
              return true;
          }
      }
      return false;
  }

  const pageInfo = document.querySelector('html');
  if (pageInfo) {
      const dataPage = pageInfo.getAttribute('data-page');
      if (dataPage && checkUiContext() && (dataPage === "problem_detail" || dataPage.includes("detail_problem"))) {
          window.addEventListener('load', initButton);
      }
  }
})();