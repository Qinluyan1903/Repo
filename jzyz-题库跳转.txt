// ==UserScript==
// @name         jzyz-题库跳转
// @version      1.0
// @description  在作业题目页添加跳转到题库题目的按钮
// @author       User
// @match        *://172.20.6.60/*
// @match        *://wn.code-fans.cn:5678/*
// @match        *://ng.code-fans.cn:5678/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';
  var url = window.location.href;

  async function JZYZ_Jump() {
      // 提取域名和题号 (例如 liyue 和 jzyz1525)
      const match = url.match(/\/d\/([^\/]+)\/p\/([^\/\?]+)/);
      if (!match) return;
      const domain = match[1];
      const pid = match[2];

      // 判断是否带参数（即在作业里）
      if (url.includes('?')) {
          // 构造纯净的题库链接，自动去除 ?tid=...
          window.location.href = `/d/${domain}/p/${pid}`;
      } else {
          alert('当前已经在题库页面了！');
      }
  }

  async function initButton() {
      // 创建按钮元素，结构与模板保持一致
      const li = document.createElement('li');
      li.className = 'menu__item nojs--hide';

      const a = document.createElement('a');
      a.className = 'menu__link';
      a.setAttribute('name', 'problem-homework-jump');

      const span = document.createElement('span');
      span.className = 'icon icon-book'; // 使用书籍图标

      const text = document.createTextNode('跳转到题库本题');

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
          await JZYZ_Jump();
      });
  }

  // 检查页面环境，逻辑沿用原模板
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